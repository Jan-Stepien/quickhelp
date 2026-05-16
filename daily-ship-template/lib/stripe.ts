import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function createCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
  mode = "payment",
}: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode?: "payment" | "subscription";
}) {
  return stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}
