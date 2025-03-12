import { crossmintApiBaseUrl, crossmintApiKey } from "@/lib/config";
import type { EditOrderRequest, GetOrderResponse } from "@/types/orders";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    // Ensure params is resolved before accessing
    const { orderId } = await params;
    console.log(`Getting order ${orderId} from Crossmint...`);

    // Get Authorization header if present (for client secret)
    const authHeader = request.headers.get("Authorization");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Use either the client secret or API key for authorization
    if (authHeader) {
      headers.Authorization = authHeader;
    } else {
      headers["X-API-KEY"] = crossmintApiKey;
    }

    const response = await fetch(
      `${crossmintApiBaseUrl}2022-06-09/orders/${orderId}`,
      {
        method: "GET",
        headers,
      }
    );

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
          message: `Failed to get order: ${response.status} ${response.statusText} - ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data: GetOrderResponse = await response.json();
    console.log("Order retrieved successfully:", data.orderId);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error getting order:", error);
    return NextResponse.json(
      {
        error: true,
        message: error instanceof Error ? error.message : "Failed to get order",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    // Ensure params is resolved before accessing
    const { orderId } = await params;
    const body: EditOrderRequest = await request.json();

    console.log(`Editing order ${orderId} with Crossmint...`, {
      recipient: body.recipient,
    });

    // Get Authorization header if present (for client secret)
    const authHeader = request.headers.get("Authorization");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Use either the client secret or API key for authorization
    if (authHeader) {
      headers.Authorization = authHeader;
    } else {
      headers["X-API-KEY"] = crossmintApiKey;
    }

    const response = await fetch(
      `${crossmintApiBaseUrl}2022-06-09/orders/${orderId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      }
    );

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
          message: `Failed to edit order: ${response.status} ${response.statusText} - ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data: GetOrderResponse = await response.json();
    console.log("Order edited successfully:", data.orderId);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error editing order:", error);
    return NextResponse.json(
      {
        error: true,
        message:
          error instanceof Error ? error.message : "Failed to edit order",
      },
      { status: 500 }
    );
  }
}
