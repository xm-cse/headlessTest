// Currency type used throughout the API
export type Currency =
  | "eth"
  | "usdc"
  | "degen"
  | "brett"
  | "toshi"
  | "usdxm"
  | "sol"
  | "bonk"
  | "wif"
  | "mother"
  | "usd"
  | "eur"
  | "aud"
  | "gbp"
  | "jpy"
  | "sgd"
  | "hkd"
  | "krw"
  | "inr"
  | "vnd"
  | string;

// Payment method
export type PaymentMethod =
  | "arbitrum-sepolia"
  | "base-sepolia"
  | "ethereum-sepolia"
  | "optimism-sepolia"
  | "arbitrum"
  | "bsc"
  | "ethereum"
  | "optimism"
  | "solana"
  | "stripe-payment-element";

// Locale
export type Locale =
  | "en-US"
  | "es-ES"
  | "fr-FR"
  | "it-IT"
  | "ko-KR"
  | "pt-PT"
  | "ja-JP"
  | "zh-CN"
  | "zh-TW"
  | "de-DE"
  | "ru-RU"
  | "tr-TR"
  | "uk-UA"
  | "th-TH"
  | "vi-VN"
  | "Klingon";

// Common price/amount object
export interface Price {
  amount: string;
  currency: Currency;
}

// Recipient information
export type Recipient =
  | {
      email: string;
      physicalAddress?: PhysicalAddress;
    }
  | {
      walletAddress: string;
      physicalAddress?: PhysicalAddress;
    };

// Physical address for shipping
export interface PhysicalAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

// Payment information for requests
export type PaymentRequest =
  | {
      receiptEmail?: string;
      method: Extract<PaymentMethod, "arbitrum-sepolia" | "base-sepolia" | "ethereum-sepolia" | "optimism-sepolia" | "arbitrum" | "bsc" | "ethereum" | "optimism">;
      currency: Extract<Currency, "eth" | "usdc" | "degen" | "brett" | "toshi" | "usdxm">;
      payerAddress?: string;
    }
  | {
      receiptEmail?: string;
      method: "solana";
      currency: Extract<Currency, "sol" | "usdc" | "bonk" | "wif" | "mother">;
      payerAddress?: string;
    }
  | {
      receiptEmail?: string;
      method: "stripe-payment-element";
      currency?: Extract<Currency, "usd" | "eur" | "aud" | "gbp" | "jpy" | "sgd" | "hkd" | "krw" | "inr" | "vnd">;
    };

// Line item metadata
export interface LineItemMetadata {
  name: string;
  description: string;
  imageUrl: string;
}

// Charges breakdown in a quote
export interface Charges {
  unit: Price;
  salesTax?: Price;
  shipping?: Price;
}

// Quote for a line item
export interface LineItemQuote {
  status: "valid" | string;
  charges: Charges;
  totalPrice: Price;
}

// Delivery information
export interface Delivery {
  status: "awaiting-payment" | string;
  recipient: {
    locator?: string;
    email?: string;
    walletAddress?: string;
  };
}

// Additional properties for call data
export interface CallDataProperties {
  quantity?: number;
  totalPrice?: string;
  quantityRange?: {
    lowerBound: string;
    upperBound: string;
  };
  [key: string]: string | number | boolean | object | undefined;
}

// Line item in an order response
export interface LineItem {
  chain: string;
  quantity: number;
  callData: CallDataProperties;
  metadata: LineItemMetadata;
  quote: LineItemQuote;
  delivery: Delivery;
}

// Overall order quote
export interface OrderQuote {
  status: "valid" | "expired" | "all-line-items-unavailable" | "requires-physical-address" | string;
  quotedAt: string;
  expiresAt: string;
  totalPrice: Price;
}

// Payment preparation details
export interface PaymentPreparation {
  chain: string;
  payerAddress: string;
  serializedTransaction: string;
  paymentAddress?: string;
}

// Payment information in response
export interface PaymentResponse {
  status: "awaiting-payment" | string;
  method: string;
  currency: Currency;
  preparation?: PaymentPreparation;
  amount?: string;
}

// Order details
export interface Order {
  orderId: string;
  phase: "payment" | string;
  locale: string;
  lineItems: LineItem[];
  quote: OrderQuote;
  payment: PaymentResponse;
}

// Create Order Response
export interface CreateOrderResponse {
  clientSecret: string;
  order: Order;
}

// Get Order Response (same as Order)
export type GetOrderResponse = Order;

// Execution parameters for token purchases
export interface ExecutionParameters {
  mode: "exact-in";
  amount: string;
  maxSlippageBps?: string;
}

// Line items for order creation
export type LineItems = 
  | {
      collectionLocator: string;
      callData?: {
        totalPrice?: string;
        [key: string]: string | number | boolean | object | undefined;
      }
    }
  | {
      productLocator: string;
    }
  | {
      tokenLocator: string;
      callData?: {
        totalPrice?: string;
        quantityRange?: {
          lowerBound: string;
          upperBound: string;
        };
        [key: string]: string | number | boolean | object | undefined;
      };
      executionParameters?: ExecutionParameters;
    }
  | Array<{
      collectionLocator: string;
      callData?: {
        totalPrice?: string;
        [key: string]: string | number | boolean | object | undefined;
      }
    }>
  | Array<{
      tokenLocator: string;
      callData?: {
        totalPrice?: string;
        quantityRange?: {
          lowerBound: string;
          upperBound: string;
        };
        [key: string]: string | number | boolean | object | undefined;
      };
      executionParameters?: ExecutionParameters;
    }>;

// Create Order Request
export interface CreateOrderRequest {
  recipient?: Recipient;
  locale?: Locale;
  payment: PaymentRequest;
  lineItems: LineItems;
}

// Edit Order Request
export interface EditOrderRequest {
  recipient?: Recipient;
  locale?: Locale;
  payment?: PaymentRequest;
}
