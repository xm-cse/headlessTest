import { crossmintApiBaseUrl, crossmintApiKey } from "@/lib/config";
import type { CreateOrderRequest, CreateOrderResponse } from "@/types/orders";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body: CreateOrderRequest = await request.json();

    console.log("Creating order with Crossmint...", {
      recipient: body.recipient,
      paymentMethod: body.payment.method,
      currency: body.payment.currency,
    });

    const response = await fetch(`${crossmintApiBaseUrl}2022-06-09/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": crossmintApiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Crossmint API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        {
          error: true,
          message: `Failed to create order: ${response.status} ${response.statusText} - ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data: CreateOrderResponse = await response.json();
    console.log("Order created successfully:", data.order.orderId);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        error: true,
        message:
          error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}
