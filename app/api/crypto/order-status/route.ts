import { NextResponse } from 'next/server';

const CROSSMINT_API_URL = 'https://staging.crossmint.com/api/2022-06-09';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json(
      { error: 'Order ID is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${CROSSMINT_API_URL}/orders/${orderId}`,
      {
        headers: {
          'x-api-key': process.env.CROSSMINT_API_KEY ?? "",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Crossmint API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch order status: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Order status fetched:', data);
    
    return NextResponse.json({
      status: data.payment.status,
      payment: data.payment
    });
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch order status' },
      { status: 500 }
    );
  }
} 