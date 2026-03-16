import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

interface CheckoutFormProps {
  amount: number;
  paymentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ amount, paymentId, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Create Payment Intent on the backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/create-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          paymentId,
        }),
      });

      const { clientSecret, error: backendError } = await response.json();

      if (backendError) {
        throw new Error(backendError);
      }

      // 2. Confirm payment on the frontend
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (stripeError) {
        setErrorMessage(stripeError.message || "An error occurred with Stripe.");
      } else if (paymentIntent.status === "succeeded") {
        alert(`Payment Successful: Successfully paid installment #${paymentId}`);
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-black/40 border border-gold-500/20 rounded-xl">
        <label className="block text-xs font-bold uppercase tracking-widest text-gold-500 mb-4">Card Information</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#ffffff",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#ef4444",
              },
            },
          }}
        />
      </div>

      {errorMessage && <div className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{errorMessage}</div>}

      <div className="flex gap-4">
        <Button type="button" variant="outline" className="flex-1 border-gold-500/20 text-white hover:bg-gold-500/10" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-gold-500 text-black hover:bg-gold-400 font-bold" disabled={!stripe || isProcessing}>
          {isProcessing ? "Processing..." : `Pay PKR ${amount.toLocaleString()}`}
        </Button>
      </div>
    </form>
  );
};
