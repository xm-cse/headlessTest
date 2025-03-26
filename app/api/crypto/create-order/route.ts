import { NextResponse } from 'next/server';

const CROSSMINT_API_URL = 'https://staging.crossmint.com/api/2022-06-09';

// Define valid options
const VALID_CHAINS = ['ethereum-sepolia', 'base-sepolia'];
const VALID_CURRENCIES = ['eth', 'usdc'];

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const chain = body.chain || 'ethereum-sepolia';
    const currency = body.currency || 'usdc';

    // Validate parameters
    if (!VALID_CHAINS.includes(chain)) {
      return NextResponse.json(
        { error: `Invalid chain: ${chain}. Valid options are: ${VALID_CHAINS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!VALID_CURRENCIES.includes(currency)) {
      return NextResponse.json(
        { error: `Invalid currency: ${currency}. Valid options are: ${VALID_CURRENCIES.join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`Creating order with Crossmint using chain=${chain}, currency=${currency}...`);
    
    const response = await fetch(`${CROSSMINT_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CROSSMINT_API_KEY ?? "",
      },
      body: JSON.stringify({
        recipient: {
          email: process.env.CROSSMINT_EMAIL ?? ""
        },
        locale: "en-US",
        payment: {
          method: chain,
          currency: currency,
          payerAddress: process.env.CROSSMINT_PAYER_ADDRESS ?? ""
        },
        lineItems: {
          collectionLocator: `crossmint:${process.env.CROSSMINT_COLLECTION_ID ?? ""}`
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Crossmint API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to create order: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Order created successfully:', data);
    
    return NextResponse.json({
      orderId: data.order.orderId,
      clientSecret: data.clientSecret,
      paymentAddress: data.order.payment.preparation?.paymentAddress,
      amount: data.order.payment.amount,
      serializedTx: data.order.payment.preparation?.serializedTransaction
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
} 