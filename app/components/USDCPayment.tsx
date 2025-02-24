'use client';

import React, { useState, useEffect, useRef } from 'react';
import { parseTransaction } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSendTransaction } from "wagmi";

interface USDCPaymentProps {
  onComplete: (orderId: string) => void;
}

interface OrderDetails {
  orderId: string;
  clientSecret: string;
  paymentAddress: string;
  amount: string;
  serializedTx?: string;
}

export function USDCPayment({ onComplete }: USDCPaymentProps) {
  const [orderStatus, setOrderStatus] = useState<'creating' | 'awaiting-payment' | 'completed' | 'processed' | 'error'>('creating');
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const orderCreated = useRef(false);
  const { data: hash, isPending, sendTransactionAsync } = useSendTransaction();
  const [isProcessing, setIsProcessing] = useState(false);

  const checkOrderStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/crypto/order-status?orderId=${orderId}`);
      const data = await response.json();
      console.log('Initial status check:', data);
    } catch (err) {
      console.error('Status check error:', err);
    }
  };

  const signAndSendTransaction = async () => {
    if (!orderDetails?.serializedTx) return;
    
    try {
      const txn = parseTransaction(orderDetails.serializedTx as `0x${string}`);
      await sendTransactionAsync({
        to: txn.to as `0x${string}`,
        value: BigInt(txn.value ? txn.value.toString() : "0"),
        data: txn.data as `0x${string}`,
        chainId: txn.chainId,
      });
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
    }
  };

  const processCryptoPayment = async () => {
    if (!orderDetails || !hash) return;
    setIsProcessing(true);
    
    const body = {
      orderId: orderDetails.orderId,
      clientSecret: orderDetails.clientSecret,
      txId: hash,
      currency: 'usdc',
      network: 'base-sepolia'
    };

    console.log('Processing crypto payment with:', {
      ...body,
      clientSecretLength: body.clientSecret?.length
    });
    
    try {
      const response = await fetch('/api/crypto/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Process payment response status:', response.status);
      const data = await response.json();
      console.log('Process payment response data:', data);

      if (!response.ok) {
        const errorMessage = data.details ? 
          `Failed to process payment: ${JSON.stringify(data.details)}` :
          `Failed to process payment: ${JSON.stringify(data)}`;
        throw new Error(errorMessage);
      }

      setOrderStatus('processed');
      onComplete(orderDetails.orderId);
    } catch (err) {
      console.error('Payment processing error:', {
        error: err,
        message: err instanceof Error ? err.message : String(err),
        orderDetails: {
          orderId: orderDetails.orderId,
          hasClientSecret: !!orderDetails.clientSecret,
          clientSecretLength: orderDetails.clientSecret?.length
        },
        hash
      });
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const createOrder = async () => {
      if (orderCreated.current) return;
      orderCreated.current = true;

      try {
        const response = await fetch('/api/crypto/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to create order');
        }

        const data = await response.json();
        console.log('Order creation response:', data);
        
        if (data.payment?.status === 'crypto-payer-insufficient-funds') {
          setError('Insufficient funds. Please make sure you have enough ETH to cover the transaction.');
          setOrderStatus('error');
          return;
        }

        setOrderDetails(data);
        setOrderStatus('awaiting-payment');
        await checkOrderStatus(data.orderId);
      } catch (err) {
        console.error('Order creation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to create order');
        setOrderStatus('error');
      }
    };

    createOrder();
  }, []);

  useEffect(() => {
    if (hash) {
      setOrderStatus('completed');
    }
  }, [hash]);

  console.log('Current orderDetails:', orderDetails);

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 p-6 text-red-500">
        <h3 className="text-xl font-bold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-zinc-800/50 p-6">
      <h2 className="text-2xl font-bold mb-4">USDC Payment</h2>
      
      {orderStatus === 'creating' && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3">Creating order...</span>
        </div>
      )}

      {orderStatus === 'completed' && hash && (
        <div className="space-y-6">
          <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20">
            <h3 className="text-xl font-bold mb-4 text-green-400">Transaction Sent</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Transaction Hash</p>
                <p className="font-mono text-sm break-all bg-zinc-900/50 p-2 rounded">{hash}</p>
              </div>
              <button
                onClick={processCryptoPayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing Payment...' : 'Process Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {orderStatus === 'processed' && (
        <div className="space-y-6">
          <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="animate-bounce bg-gradient-to-r from-green-400 to-emerald-400 rounded-full p-2">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-green-400">Congratulations!</h3>
              <p className="text-lg text-zinc-300 mb-4">Payment successfully completed</p>
              <p className="text-sm text-zinc-400">Check your inbox to find the minted NFT!</p>
            </div>
          </div>
        </div>
      )}

      {orderStatus === 'awaiting-payment' && orderDetails && (
        <div className="space-y-6">
          <div className="bg-indigo-500/10 rounded-lg p-6 border border-indigo-500/20">
            <h3 className="text-xl font-bold mb-4 text-indigo-400">Payment Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Order ID</p>
                <p className="font-mono text-sm break-all bg-zinc-900/50 p-2 rounded">{orderDetails.orderId}</p>
              </div>
              <div>
                <ConnectButton showBalance={false} chainStatus="full" accountStatus="full" />
              </div>
              {orderDetails.serializedTx && (
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Transaction Details</p>
                  <p className="font-mono text-sm break-all bg-zinc-900/50 p-2 rounded">{orderDetails.serializedTx}</p>
                  {error && (
                    <div className="mt-2 p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                      {error.includes('insufficient funds') ? 
                        'Insufficient funds. Please make sure you have enough ETH to cover the transaction.' : 
                        error
                      }
                    </div>
                  )}
                  <button
                    onClick={() => signAndSendTransaction()}
                    disabled={isPending}
                    className="mt-4 w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Confirming...' : 'Send Transaction'}
                  </button>
                  {hash && (
                    <div className="mt-4 p-2 bg-zinc-900/50 rounded">
                      <p className="text-sm text-zinc-400">Transaction Hash:</p>
                      <code className="text-xs break-all">{hash}</code>
                    </div>
                  )}
                </div>
              )}
              <div>
                <p className="text-sm text-zinc-400 mb-1">Payment Address</p>
                <p className="font-mono text-sm break-all bg-zinc-900/50 p-2 rounded">{orderDetails.paymentAddress}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-1">Amount</p>
                <p className="font-mono text-sm break-all bg-zinc-900/50 p-2 rounded">{orderDetails.amount} USDC</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 