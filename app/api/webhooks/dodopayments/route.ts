import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { setUserPlan } from "@/lib/firestore";

// Webhook endpoint: /api/webhooks/dodopayments
//
// WHO calls this? Dodopayments' servers — NOT the browser.
// WHEN? After a successful payment, Dodopayments sends a POST request here
//       with details of what happened (event.type = "payment.succeeded").
//
// WHY do we need to verify the signature?
//   This is a PUBLIC URL — anyone on the internet could POST to it. Without
//   verification, an attacker could send a fake "payment.succeeded" event and
//   get a free premium upgrade. The HMAC signature check is the guard:
//
//   How HMAC works (mental model):
//     shared_secret = DODO_WEBHOOK_SECRET (only you and Dodopayments know it)
//     signature     = HMAC-SHA256(shared_secret, raw_request_body)
//
//     Dodopayments signs the body before sending → attaches as dodo-signature header.
//     We re-compute the same signature → if they match, the body is authentic.
//     If an attacker changes even one character of the body, the signature won't match.
//
// Full payment flow in context:
//   Browser → POST /api/checkout → Dodopayments API → checkout_url
//   User pays on Dodopayments' site
//   Dodopayments → POST /api/webhooks/dodopayments (THIS ROUTE)
//   This route upgrades user's plan in Firestore → done.

export async function POST(req: NextRequest) {
  // IMPORTANT: read the body as raw text BEFORE parsing JSON.
  // The HMAC must be computed on the exact bytes Dodopayments sent —
  // if we parsed JSON first and re-serialized, tiny differences (key order,
  // whitespace) would break the signature comparison.
  const rawBody = await req.text();
  const signature = req.headers.get("dodo-signature");

  const expectedSignature = crypto
    .createHmac("sha256", process.env.DODO_WEBHOOK_SECRET || "")
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("Webhook signature mismatch — possible spoofed request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Only parse JSON AFTER signature verification passes.
  const event = JSON.parse(rawBody);

  if (event.type === "payment.succeeded") {
    // customer_reference is the uid we passed when creating the checkout session
    // in /api/checkout. This is how we tie the payment back to a specific user.
    const uid = event.data.customer_reference;
    await setUserPlan(uid, "premium");
    // setUserPlan writes to the users/{uid} document in Firestore.
    // The Firestore Security Rules block clients from writing to users/*, so
    // only this server-side Admin SDK call can ever elevate a plan to "premium".
  }

  // Always return 200 quickly once verified — Dodopayments will retry
  // with exponential backoff if it doesn't receive a 2xx acknowledgment.
  // Do NOT do slow work (email sending etc.) before returning — offload that
  // to a background job instead.
  return NextResponse.json({ received: true });
}
