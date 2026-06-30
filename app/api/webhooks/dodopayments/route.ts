import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { setUserPlan } from "@/lib/firestore";

// This endpoint is called by DODOPAYMENTS' SERVERS, not by your frontend.
// Because it's a public URL by necessity, the FIRST thing it must do is
// prove the request really came from Dodopayments — same trust-but-verify
// pattern as JWT verification, just with a different cryptographic scheme
// (HMAC instead of asymmetric signing).
export async function POST(req: NextRequest) {
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

  const event = JSON.parse(rawBody);

  if (event.type === "payment.succeeded") {
    const uid = event.data.customer_reference;
    await setUserPlan(uid, "premium");
  }

  // Always return 200 quickly once verified — Dodopayments will retry
  // with backoff if it doesn't get an acknowledgment.
  return NextResponse.json({ received: true });
}
