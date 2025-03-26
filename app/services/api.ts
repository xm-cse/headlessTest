/**
 * API Service for Crossmint integration
 * This service handles all interactions with the backend API
 */

// Types
export interface OrderDetails {
  orderId: string;
  clientSecret: string;
  paymentAddress: string;
  amount: string;
  serializedTx?: string;
}

export interface OrderStatusResponse {
  status: string;
  payment: {
    status: string;
    [key: string]: any;
  };
}

export type ChainOption = 'ethereum-sepolia' | 'base-sepolia';
export type CurrencyOption = 'eth' | 'usdc';

// Available options for chains and currencies
export const CHAIN_OPTIONS: { id: ChainOption; name: string }[] = [
  { id: 'ethereum-sepolia', name: 'Ethereum Sepolia' },
  { id: 'base-sepolia', name: 'Base Sepolia' }
];

export const CURRENCY_OPTIONS: { id: CurrencyOption; name: string }[] = [
  { id: 'eth', name: 'ETH' },
  { id: 'usdc', name: 'USDC' }
];

export interface CreateOrderParams {
  chain: ChainOption;
  currency: CurrencyOption;
}

/**
 * Creates a new order for crypto payment
 */
export async function createOrder(params: CreateOrderParams): Promise<OrderDetails> {
  const response = await fetch('/api/crypto/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create order: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Checks the status of an existing order
 */
export async function checkOrderStatus(orderId: string): Promise<OrderStatusResponse> {
  const response = await fetch(`/api/crypto/order-status?orderId=${orderId}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Status check failed: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

/**
 * Helper to handle API errors consistently
 */
export function handleApiError(error: unknown): string {
  console.error('API error:', error);
  if (error instanceof Error) {
    // Check for common errors and provide user-friendly messages
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds. Please make sure you have enough ETH to cover the transaction.';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
} 