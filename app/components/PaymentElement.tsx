import {
  Elements,
  PaymentElement as StripePaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import axios from "axios";
import type { CreateOrderRequest } from "@/types/orders";
import { crossmintCollectionId, crossmintDefaultEmail } from "@/lib/config";

interface PaymentElementProps {
  onComplete: (orderId: string) => void;
}

export function PaymentElement({ onComplete }: PaymentElementProps) {
  const [orderData, setOrderData] = useState<{
    clientSecret?: string;
    orderId?: string;
    stripePublishableKey?: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createOrder() {
      try {
        // Create initial order
        const createOrderRequest: CreateOrderRequest = {
          payment: {
            method: "stripe-payment-element",
          },
          lineItems: {
            collectionLocator: `crossmint:${crossmintCollectionId}`,
            callData: {
              quantity: 1,
            },
          },
        };

        const createOrderResponse = await axios.post(
          "/api/orders",
          createOrderRequest
        );

        const { order } = createOrderResponse.data;
        const orderId = order.orderId;

        // Update order with recipient
        await axios.patch(`/api/orders/${orderId}`, {
          recipient: {
            email: crossmintDefaultEmail,
          },
        });

        // Get updated order details
        const getOrderResponse = await axios.get(`/api/orders/${orderId}`);

        const stripePublishableKey =
          getOrderResponse.data.payment.preparation.stripePublishableKey;
        const stripeClientSecret =
          getOrderResponse.data.payment.preparation.stripeClientSecret;

        setOrderData({
          clientSecret: stripeClientSecret,
          orderId,
          stripePublishableKey,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error creating order:", err);
        setError("Failed to create order. Please try again.");
        setLoading(false);
      }
    }

    createOrder();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-12 text-center">{error}</div>;
  }

  if (
    !orderData.stripePublishableKey ||
    !orderData.clientSecret ||
    !orderData.orderId
  ) {
    return (
      <div className="text-red-500 p-12 text-center">
        Missing payment configuration
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <ElementsProviderWrapper
        stripePublishableKey={orderData.stripePublishableKey}
        stripeClientSecret={orderData.clientSecret}
      >
        <div className="w-full p-6 bg-zinc-800/50 backdrop-blur rounded-xl border border-zinc-700">
          <StripePaymentElement
            className="w-full mb-6"
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: {
                  name: "Test User",
                  email: crossmintDefaultEmail,
                },
              },
              paymentMethodOrder: ["card", "apple_pay", "google_pay"],
            }}
          />
          <SubmitButton orderId={orderData.orderId} onComplete={onComplete} />
        </div>
      </ElementsProviderWrapper>
    </div>
  );
}

function ElementsProviderWrapper({
  stripePublishableKey,
  stripeClientSecret,
  children,
}: {
  stripePublishableKey: string;
  stripeClientSecret: string;
  children: React.ReactNode;
}) {
  const stripePromise = loadStripe(stripePublishableKey);
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: stripeClientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#4F46E5",
            colorBackground: "#18181B",
            colorText: "#FFFFFF",
            colorDanger: "#EF4444",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          },
        },
        loader: "auto",
      }}
      key={`${stripeClientSecret}-${stripePublishableKey}`}
    >
      {children}
    </Elements>
  );
}

function SubmitButton({
  orderId,
  onComplete,
}: {
  orderId: string;
  onComplete: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!stripe || !elements) {
      console.error("[handleSubmit] Stripe.js hasn't loaded yet");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      console.log("[handleSubmit] Starting payment confirmation...");

      const { error: elementsError } = await elements.submit();
      if (elementsError) {
        console.error(
          "[handleSubmit] Elements submission error:",
          elementsError
        );
        setPaymentError(
          elementsError.message || "Failed to submit payment details"
        );
        return;
      }

      console.log(
        "[handleSubmit] Elements submitted successfully, confirming payment..."
      );

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
          payment_method_data: {
            billing_details: {
              name: "Test User",
              email: "test@example.com",
            },
          },
        },
        redirect: "if_required",
      });

      console.log("[handleSubmit] Payment confirmation result:", result);

      if (result.error) {
        console.error("[handleSubmit] Payment confirmation error:", {
          type: result.error.type,
          message: result.error.message,
          code: result.error.code,
          decline_code: result.error.decline_code,
        });
        setPaymentError(result.error.message || "Failed to confirm payment");
        return;
      }

      if (result.paymentIntent) {
        console.log("[handleSubmit] Payment successful:", {
          id: result.paymentIntent.id,
          status: result.paymentIntent.status,
        });
        onComplete(orderId);
      }
    } catch (err) {
      console.error("[handleSubmit] Unexpected error:", err);
      setPaymentError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="w-full">
      {paymentError && (
        <div className="mb-4 p-3 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded">
          {paymentError}
        </div>
      )}
      <button
        type="button"
        className={`w-full py-3 px-4 text-white font-medium rounded-lg ${
          isProcessing
            ? "bg-indigo-500/50 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
        onClick={handleSubmit}
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          "Pay Now"
        )}
      </button>
    </div>
  );
}
