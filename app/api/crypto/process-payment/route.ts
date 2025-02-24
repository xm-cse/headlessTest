import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, clientSecret, txId, currency, network } = body;

    console.log('Processing payment with:', {
      orderId,
      txId,
      currency,
      network,
      clientSecretLength: clientSecret?.length
    });

    if (!orderId || !clientSecret || !txId || !currency || !network) {
      console.error('Missing required fields:', { orderId, txId, currency, network, hasClientSecret: !!clientSecret });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const url = `https://staging.crossmint.com/api/2023-06-09/checkout/orders/${orderId}/process-crypto-payment`;
    const requestHeaders = {
      'Authorization': clientSecret,
      'Content-Type': 'application/json',
    };
    const requestBody = {
      txId,
      currency,
      network
    };

    console.log('=== Crossmint API Call Details ===');
    console.log('URL:', url);
    console.log('Headers:', requestHeaders);
    console.log('Body:', JSON.stringify(requestBody, null, 2));
    console.log('===============================');

    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    console.log('Crossmint API response status:', response.status);

    if (response.status === 204) {
      // Success with no content
      return NextResponse.json({ success: true });
    }

    let data;
    try {
      data = await response.json();
      console.log('Crossmint API response data:', data);
    } catch (e) {
      console.log('No JSON response body');
      data = null;
    }

    if (!response.ok) {
      console.error('Crossmint API error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      return NextResponse.json(
        { 
          error: 'Failed to process payment',
          status: response.status,
          details: data 
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data || { success: true });
  } catch (error) {
    console.error('Error processing payment:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Internal server error', message: error.message, stack: error.stack },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    );
  }
} 