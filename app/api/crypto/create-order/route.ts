import { NextResponse } from 'next/server';

const CROSSMINT_API_URL = 'https://staging.crossmint.com/api/2022-06-09';

export async function POST() {
  try {
    console.log('Creating order with Crossmint...');
    const response = await fetch(`${CROSSMINT_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CROSSMINT_API_KEY!,
      },
      body: JSON.stringify({
        recipient: {
          email: process.env.CROSSMINT_EMAIL
        },
        locale: "en-US",
        payment: {
          method: "base-sepolia",
          currency: "usdc",
          payerAddress: process.env.CROSSMINT_PAYER_ADDRESS
        },
        lineItems: {
          collectionLocator: `crossmint:${process.env.CROSSMINT_COLLECTION_ID}`
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