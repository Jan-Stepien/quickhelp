import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";

// REPLACE: your Stripe price ID from dashboard.stripe.com/products
const PRICE_ID = process.env.STRIPE_PRICE_ID!;

export async function GET(req: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await createCheckoutSession({
    priceId: PRICE_ID,
    successUrl: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/app`,
    mode: "payment", // change to "subscription" for monthly billing
  });

  return NextResponse.redirect(session.url!);
}
