# Micro-startup stack starter

A working example of the Next.js + Firebase Auth + Firestore + Dodopayments
stack: sign in with Google, write notes scoped to your account, and a
checkout/webhook flow stubbed in for Dodopayments. Maps directly to the
"Micro-Startup Stack" reference doc — every API route here corresponds to
one arrow in that architecture diagram.

## Run it locally (works immediately, no credentials needed yet)

```bash
npm install
npm run dev
```

Open http://localhost:3000. The page loads, but sign-in won't work until you
add Firebase credentials below — that's expected.

## Repository notes

- Install dependencies locally with `npm install`.
- Do not commit `node_modules`; it is ignored in this repository.
- Keep source files and lockfiles such as `package-lock.json` or `pnpm-lock.yaml`
  in Git.
- If you clone this repo on another machine, run `npm install` there before
  starting the app.

## Step 1: Create your Firebase project (free)

1. Go to https://console.firebase.google.com and create a new project.
2. In the project, go to **Build > Authentication > Get started**, and
   enable the **Google** sign-in provider.
3. Go to **Build > Firestore Database > Create database**, start in
   **production mode** (we provide real Security Rules, see below).
4. Go to **Project settings (gear icon) > General**, scroll to "Your apps",
   click the web icon (`</>`) to register a web app. Copy the config values
   into `.env.local` (copy `.env.example` to `.env.local` first) — these are
   the `NEXT_PUBLIC_FIREBASE_*` values.
5. Still in Project settings, go to **Service accounts > Generate new
   private key**. This downloads a JSON file. Open it, copy the entire
   contents, and paste them as ONE LINE into `FIREBASE_SERVICE_ACCOUNT_KEY`
   in `.env.local`.

## Step 2: Deploy the Firestore Security Rules

Install the Firebase CLI once, then deploy the rules file included here:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project, accept defaults
firebase deploy --only firestore:rules
```

This pushes `firestore.rules` (already written for you in this repo) so the
database itself rejects any read/write that isn't from the document's owner
— independent of and in addition to the checks in the API routes.

## Step 3: Dodopayments (optional — only needed for the payment flow)

1. Sign up at https://dodopayments.com (works as an individual, no business
   registration required).
2. Create a product for your premium plan, copy its ID into
   `DODO_PREMIUM_PRODUCT_ID`.
3. Find your API key in the dashboard, copy into `DODO_API_KEY`.
4. Register a webhook pointing at
   `https://YOUR-DEPLOYED-URL/api/webhooks/dodopayments` once you've
   deployed (webhooks can't reach `localhost`). Copy the signing secret into
   `DODO_WEBHOOK_SECRET`.

The app runs fine without this step — you just won't be able to complete a
real checkout until it's configured.

## Step 4: Deploy to Cloud Run (when you're ready to go live)

```bash
gcloud run deploy micro-startup-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=...,...
```

(In practice, set env vars via `gcloud run services update` with
`--set-env-vars` reading from a file, or use Secret Manager for the secret
values — never commit `.env.local` to git.)

## How the pieces map to the code

| Concept                          | File                                       |
|-----------------------------------|---------------------------------------------|
| Firebase client init              | `lib/firebase-client.ts`                   |
| Firebase Admin init (server only) | `lib/firebase-admin.ts`                    |
| JWT verification                  | `lib/auth-server.ts`                       |
| Firestore reads/writes             | `lib/firestore.ts`                         |
| Database-level authorization      | `firestore.rules`                          |
| Sign-in UI                        | `components/AuthButton.tsx`                |
| Notes UI                          | `components/NotesList.tsx`                 |
| Notes API (GET/POST)              | `app/api/notes/route.ts`                   |
| Checkout session creation         | `app/api/checkout/route.ts`                |
| Payment webhook                   | `app/api/webhooks/dodopayments/route.ts`   |

## What this is and isn't

This is a real, runnable scaffold — not a mockup. Once you add your own
Firebase and Dodopayments credentials, every flow described (sign-in, note
creation, checkout, webhook-driven plan upgrade) actually works end to end.

What it doesn't include yet: error boundaries, loading skeletons, rate
limiting on the API routes, email verification UI, or production logging —
intentionally left out so the core data flow stays readable. Good next
additions once the basic flow feels solid.
