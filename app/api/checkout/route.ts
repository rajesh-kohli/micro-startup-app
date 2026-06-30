import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";

// This route never touches a credit card number. It asks Dodopayments to
// create a hosted checkout session and hands the browser a URL to redirect
// to. Dodopayments collects the payment on their own domain.
export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUser(req);

    const response = await fetch("https://api.dodopayments.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: process.env.DODO_PREMIUM_PRODUCT_ID,
        customer_reference: uid, // ties the eventual webhook back to this user
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/notes?upgraded=true`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Dodopayments error: ${response.status}`);
    }

    const { checkout_url } = await response.json();
    return NextResponse.json({ checkout_url });
  } catch (err) {
    console.error("Checkout session error:", err);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
