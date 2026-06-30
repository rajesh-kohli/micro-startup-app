// This file initializes Firebase Admin for use ON THE SERVER ONLY.
// It is never imported by any 'use client' component or shipped to the browser.
// The service account credentials here are powerful (they can read/write ANY
// data, bypassing Security Rules) — that's exactly why this code must stay
// server-side. Never expose these values with a NEXT_PUBLIC_ prefix.

import { initializeApp, getApps, cert, App } from "firebase-admin/app";

// Lazy singleton: the credential is only parsed and verified the FIRST time
// something actually calls getAdminApp() — e.g. when a request hits an API
// route. This matters because Next.js statically analyzes API routes during
// `next build`, which would otherwise try to initialize Firebase (and fail)
// even on a build machine that doesn't have production secrets available.
let _adminApp: App | undefined;

export function getAdminApp(): App {
  if (_adminApp) return _adminApp;
  if (getApps().length) {
    _adminApp = getApps()[0];
    return _adminApp;
  }

  // The service account key is stored as a single-line JSON string in .env.local
  // (see README for how to generate it from the Firebase console).
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
  );

  _adminApp = initializeApp({
    credential: cert(serviceAccount),
  });
  return _adminApp;
}
