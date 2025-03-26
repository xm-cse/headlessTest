'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { parseTransaction } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSendTransaction } from "wagmi";
import { 
  createOrder, 
  checkOrderStatus, 
  handleApiError, 
  OrderDetails,
  ChainOption,
  CurrencyOption,
  CHAIN_OPTIONS,
  CURRENCY_OPTIONS
} from '../services/api';
import { 
  LoadingSpinner, 
  ErrorMessage, 
  SuccessMessage, 
  CodeDisplay, 
  TransactionButton,
  PaymentContainer,
  PaymentOptionsSelector
} from './ui/PaymentUI';

interface USDCPaymentProps {
  onComplete: (orderId: string) => void;
}

// For the API response that includes payment status
interface OrderResponse extends OrderDetails {
  payment?: {
    status?: string;
    [key: string]: any;
  };
}

// Payment status types for better type safety
type OrderStatus = 'selecting-options' | 'creating' | 'awaiting-payment' | 'processed' | 'error';

export function USDCPayment({ onComplete }: USDCPaymentProps) {
  // Order and status state
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('selecting-options');
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const orderCreated = useRef(false);
  
  // Chain and currency selection state
  const [selectedChain, setSelectedChain] = useState<ChainOption>('ethereum-sepolia');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>('usdc');
  
  // Transaction state
  const { data: hash, isPending, sendTransactionAsync } = useSendTransaction();

  // Handle chain selection
  const handleChainChange = useCallback((chain: ChainOption) => {
    setSelectedChain(chain);
  }, []);

  // Handle currency selection
  const handleCurrencyChange = useCallback((currency: CurrencyOption) => {
    setSelectedCurrency(currency);
  }, []);

  // Start the order creation process
  const handleStartPayment = useCallback(() => {
    setOrderStatus('creating');
    orderCreated.current = false;
  }, []);

  // Check order status
  const fetchOrderStatus = useCallback(async (orderId: string): Promise<void> => {
    try {
      const data = await checkOrderStatus(orderId);
      console.log('Order status check:', data);
    } catch (err) {
      console.error('Status check error:', err);
      // Not setting error state here as this is just informational
    }
  }, []);

  // Sign and send transaction
  const signAndSendTransaction = useCallback(async (): Promise<void> => {
    if (!orderDetails?.serializedTx) {
      setError('No transaction details available');
      return;
    }
    
    try {
      const txn = parseTransaction(orderDetails.serializedTx as `0x${string}`);
      await sendTransactionAsync({
        to: txn.to as `0x${string}`,
        value: BigInt(txn.value ? txn.value.toString() : "0"),
        data: txn.data as `0x${string}`,
        chainId: txn.chainId,
      });
    } catch (err) {
      setError(handleApiError(err));
    }
  }, [orderDetails, sendTransactionAsync]);

  // Create order only when status is 'creating'
  useEffect(() => {
    const initializeOrder = async (): Promise<void> => {
      if (orderCreated.current || orderStatus !== 'creating') return;
      orderCreated.current = true;

      try {
        const data = await createOrder({
          chain: selectedChain,
          currency: selectedCurrency
        }) as OrderResponse;
        
        console.log('Order creation response:', data);
        
        // Check for insufficient funds in the API response
        if (data.payment?.status === 'crypto-payer-insufficient-funds') {
          setError('Insufficient funds. Please make sure you have enough ETH to cover the transaction.');
          setOrderStatus('error');
          return;
        }

        setOrderDetails(data);
        setOrderStatus('awaiting-payment');
        await fetchOrderStatus(data.orderId);
      } catch (err) {
        setError(handleApiError(err));
        setOrderStatus('error');
      }
    };

    initializeOrder();
  }, [orderStatus, selectedChain, selectedCurrency, fetchOrderStatus]);

  // Handle transaction confirmation and transition to processed state
  useEffect(() => {
    if (hash && orderDetails) {
      console.log('Transaction confirmed, webhook will process the payment.');
      setOrderStatus('processed');
      onComplete(orderDetails.orderId);
    }
  }, [hash, orderDetails, onComplete]);

  // Render different UI states based on order status
  const renderContent = () => {
    if (error) {
      return (
        <>
          <ErrorMessage message={error} />
          <button
            onClick={() => {
              setError(null);
              setOrderStatus('selecting-options');
              orderCreated.current = false;
            }}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </>
      );
    }

    switch (orderStatus) {
      case 'selecting-options':
        return (
          <>
            <PaymentOptionsSelector
              chainOptions={CHAIN_OPTIONS}
              currencyOptions={CURRENCY_OPTIONS}
              selectedChain={selectedChain}
              selectedCurrency={selectedCurrency}
              onChainChange={handleChainChange}
              onCurrencyChange={handleCurrencyChange}
            />
            <button
              onClick={handleStartPayment}
              className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded"
            >
              Continue with {selectedCurrency.toUpperCase()} on {
                CHAIN_OPTIONS.find(option => option.id === selectedChain)?.name
              }
            </button>
          </>
        );
      
      case 'creating':
        return <LoadingSpinner text="Creating order..." />;
        
      case 'processed':
        return <SuccessMessage />;
        
      case 'awaiting-payment':
        if (!orderDetails) return null;
        
        return (
          <div className="space-y-6">
            <div className="bg-indigo-500/10 rounded-lg p-6 border border-indigo-500/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-indigo-400">Payment Details</h3>
                <div className="px-3 py-1 rounded-full bg-indigo-900/50 text-xs font-semibold text-indigo-300">
                  {selectedCurrency.toUpperCase()} on {
                    CHAIN_OPTIONS.find(option => option.id === selectedChain)?.name
                  }
                </div>
              </div>
              
              <div className="space-y-4">
                <CodeDisplay label="Order ID" code={orderDetails.orderId} />
                
                <div>
                  <ConnectButton showBalance={false} chainStatus="full" accountStatus="full" />
                </div>
                
                {orderDetails.serializedTx && (
                  <div>
                    <CodeDisplay label="Transaction Details" code={orderDetails.serializedTx} />
                    
                    {error && (
                      <div className="mt-2 p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                        {error.includes('insufficient funds') ? 
                          'Insufficient funds. Please make sure you have enough ETH to cover the transaction.' : 
                          error
                        }
                      </div>
                    )}
                    
                    <TransactionButton 
                      onClick={signAndSendTransaction}
                      disabled={isPending}
                      isPending={isPending}
                    />
                    
                    {hash && (
                      <div className="mt-4 p-2 bg-zinc-900/50 rounded">
                        <p className="text-sm text-zinc-400">Transaction Hash:</p>
                        <code className="text-xs break-all">{hash}</code>
                      </div>
                    )}
                  </div>
                )}
                
                <CodeDisplay label="Payment Address" code={orderDetails.paymentAddress} />
                <CodeDisplay label="Amount" code={`${orderDetails.amount} ${selectedCurrency.toUpperCase()}`} />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <PaymentContainer title="Crypto Payment">
      {renderContent()}
    </PaymentContainer>
  );
} 