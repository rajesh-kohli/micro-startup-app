// Every protected API route calls this function first. It reads the
// Firebase ID token (the JWT) from the request's cookies, verifies its
// cryptographic signature against Firebase's public keys, and returns the
// trustworthy user ID — or throws if the token is missing, expired, or forged.

import { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "./firebase-admin";

export async function verifyUser(req: NextRequest): Promise<string> {
  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    throw new Error("No auth token provided");
  }

  // This is a LOCAL cryptographic check — it does not call out to Firebase's
  // servers. Firebase's public signing keys are fetched and cached, so
  // verification is fast even under load.
  const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
  return decoded.uid;
}
