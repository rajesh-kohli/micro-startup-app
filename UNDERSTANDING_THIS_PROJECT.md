# Understanding This Project — A Complete Guide for Python Developers

> Written for someone who knows Python but is new to web/app development.
> Everything is explained from first principles, with visuals and analogies.

---

## Table of Contents

1. [What is a web app, actually?](#1-what-is-a-web-app-actually)
2. [The mental model: Browser vs Server](#2-the-mental-model-browser-vs-server)
3. [Languages and file types used here](#3-languages-and-file-types-used-here)
4. [What is a framework? (Next.js explained)](#4-what-is-a-framework-nextjs-explained)
5. [The old way vs the new way](#5-the-old-way-vs-the-new-way)
6. [Every file in this project explained](#6-every-file-in-this-project-explained)
7. [How users talk to servers: HTTP and APIs](#7-how-users-talk-to-servers-http-and-apis)
8. [Authentication: who are you?](#8-authentication-who-are-you)
9. [The database: Firestore](#9-the-database-firestore)
10. [Payments and webhooks](#10-payments-and-webhooks)
11. [Security: the two layers](#11-security-the-two-layers)
12. [The complete user journey, step by step](#12-the-complete-user-journey-step-by-step)
13. [How to implement this, start to finish](#13-how-to-implement-this-start-to-finish)
14. [Jargon glossary](#14-jargon-glossary)

---

## 1. What is a web app, actually?

When you write a Python script, it runs on YOUR computer. You run it, it does stuff, it prints output, done.

A web app is different. It has to serve MANY people at once, over the internet, from a computer they never touch (a "server"), and display results inside a web browser.

Think of it like a restaurant vs cooking at home:

```
COOKING AT HOME (Python script)
================================
You (the user) = also the cook
You have direct access to the fridge (data)
You make exactly what you want
Only you eat the result

RESTAURANT (web app)
=====================
You (the user) = customer sitting at a table  ← this is the BROWSER
The kitchen    = a computer far away          ← this is the SERVER
The menu       = the available pages/features
The waiter     = HTTP requests (messages back and forth)
The fridge     = the database
```

So when you open `https://someapp.com/notes`, here's what actually happens:

```
YOUR LAPTOP                               SERVER (far away computer)
(Browser: Chrome/Safari/Firefox)          (running Next.js)
─────────────────────────────────         ─────────────────────────────────
1. You type the URL and press Enter
2. Browser sends a message:               3. Server receives the message
   "GET /notes please"          ───────→  4. Server builds the HTML page
                                          5. Server sends it back
6. Browser receives HTML        ←───────  (the full page as text)
7. Browser draws it on screen
```

That back-and-forth message is called an **HTTP request**. Every click, every page load, every form submission is one of these messages.

---

## 2. The mental model: Browser vs Server

This is THE most important concept in web development. Everything else follows from it.

```
╔══════════════════════════════════╗     ╔══════════════════════════════════╗
║           BROWSER                ║     ║            SERVER                ║
║       (runs on YOUR laptop)      ║     ║    (runs on a cloud computer)    ║
╠══════════════════════════════════╣     ╠══════════════════════════════════╣
║                                  ║     ║                                  ║
║  What the USER sees and clicks   ║     ║  Where the WORK happens          ║
║  HTML drawn on screen            ║     ║  Talks to database               ║
║  CSS styling                     ║     ║  Checks passwords                ║
║  JavaScript/TypeScript           ║     ║  Stores/retrieves data           ║
║  React components ("use client") ║     ║  Handles payments                ║
║                                  ║     ║  Keeps SECRETS safe              ║
║  ⚠️  Code is VISIBLE to anyone   ║     ║  ✅ Code is private               ║
║  ⚠️  Can be tampered with        ║     ║  ✅ Trusted, runs in controlled   ║
║  ⚠️  NEVER put passwords here    ║     ║     environment                  ║
║                                  ║     ║                                  ║
╚══════════════════════════════════╝     ╚══════════════════════════════════╝
          ↑                                          ↑
   components/ folder                    app/api/ folder
   AuthButton.tsx                        lib/ folder
   NotesList.tsx                         firestore.rules (deployed separately)
```

### Python analogy

In Python, this distinction doesn't usually exist — your script has access to everything. But imagine:

```python
# This is like BROWSER code — visible to the user, no secrets
def show_homepage():
    print("Welcome! Click here to login.")

# This is like SERVER code — hidden, has access to secrets
def check_password(username, password):
    # Only runs on the server — user never sees this code
    real_password = database.get(username)  # talks to DB
    return real_password == hash(password)
```

---

## 3. Languages and file types used here

You know Python (`.py` files). Here's everything else you'll encounter:

### TypeScript (`.ts` files) — the main language

TypeScript is JavaScript with types added. JavaScript is the only language browsers can natively run. TypeScript compiles (translates) to JavaScript before being run.

```python
# Python — types are optional, added with hints
def add(a: int, b: int) -> int:
    return a + b
```

```typescript
// TypeScript — types are required, checked at compile time
function add(a: number, b: number): number {
    return a + b;
}
```

They look similar! Key differences:
- `const`/`let` instead of just `variable_name =`
- `function` keyword or arrow functions (`=>`)
- Types after a colon, like Python type hints but enforced
- Curly braces `{}` for blocks instead of indentation (Python uses indentation)
- Semicolons at end of lines (optional but common)
- `import`/`export` works the same concept as Python's `import`

### TSX (`.tsx` files) — TypeScript + HTML mixed together

TSX is TypeScript files that also contain HTML-like markup called JSX.

```tsx
// This is valid TSX — TypeScript code with HTML-looking pieces inside
export default function MyButton() {
    const message = "Click me!";
    return (
        <button onClick={() => alert("Hi!")}>
            {message}
        </button>
    );
}
```

Think of it like Python's f-strings, but for entire HTML structures:
```python
# Python f-string — embed variables in text
name = "World"
html = f"<h1>Hello {name}</h1>"
```
```tsx
// TSX — embed variables AND logic in HTML structure
const name = "World";
return <h1>Hello {name}</h1>;
```

### JSON (`.json` files)

You know this — it's the same as Python dictionaries:
```python
# Python dict
{"name": "myapp", "version": "1.0"}
```
```json
{ "name": "myapp", "version": "1.0" }
```

`package.json` is like Python's `requirements.txt` — lists what libraries this project needs.

### CSS (`.css` files) — styling

CSS controls how things look: colors, sizes, fonts, layout. This project uses Tailwind CSS, which is CSS pre-written as short class names you apply to HTML elements.

```html
<!-- Instead of writing CSS rules in a separate file... -->
<button class="rounded-md bg-black px-4 py-2 text-white">
    Click me
</button>
<!-- "rounded-md" = rounded corners, "bg-black" = black background, etc. -->
```

You don't need to write CSS yourself — Tailwind class names are already applied in the `.tsx` files.

### `.rules` files — Firestore Security Rules

`firestore.rules` is its own special language for controlling who can read/write what in the database. It's not Python or TypeScript — it's Firebase's own rule syntax.

### File extension summary

| Extension | What it is | Python equivalent |
|-----------|-----------|-------------------|
| `.ts` | TypeScript (server logic, utilities) | `.py` |
| `.tsx` | TypeScript + HTML markup (UI components) | `.py` + a template file |
| `.json` | Data/config in key-value format | dict saved to a file |
| `.css` | Styling (colors, layout, fonts) | no equivalent |
| `.rules` | Database access control rules | no equivalent |
| `.md` | Markdown — plain text with formatting | no equivalent (README) |
| `.mjs` | JavaScript config file | `.py` config file |

---

## 4. What is a framework? (Next.js explained)

A **framework** is a set of pre-built code that handles the boring, repetitive parts so you focus on your actual app logic.

### Python analogy

Imagine writing a web server from scratch in Python using raw sockets vs using Flask:

```python
# WITHOUT a framework — raw Python sockets (you'd do this yourself)
import socket
server = socket.socket(...)
server.bind(('0.0.0.0', 80))
# manually parse HTTP headers
# manually route URLs
# manually serialize responses
# ... hundreds of lines of boilerplate

# WITH Flask (a framework) — framework handles all the above
from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/notes', methods=['GET'])
def get_notes():
    return jsonify({"notes": []})
```

**Next.js** is like Flask, but for building full apps (both the visual browser part AND the API server part), with many more built-in features.

### What Next.js gives you for free

```
WITHOUT Next.js, you'd manually handle:         Next.js handles it FOR you:
─────────────────────────────────────           ──────────────────────────────
Routing (which URL shows which page)    →       File = route (app/notes/page.tsx = /notes)
Building/compiling TypeScript           →       Automatic on save
Splitting code (only send needed JS)    →       Automatic
Server-side vs client-side rendering    →       Just add/remove "use client"
API endpoints                           →       File = endpoint (app/api/notes/route.ts)
Hot reloading (see changes instantly)   →       npm run dev
Production optimization                 →       npm run build
```

### The App Router (the modern Next.js way)

This project uses **Next.js App Router** — the current (2024+) way to build with Next.js. The folder structure IS the routing:

```
app/
├── page.tsx          → visiting "/"  (home page)
├── layout.tsx        → wrapper around every page
├── notes/
│   └── page.tsx      → visiting "/notes"
└── api/
    ├── notes/
    │   └── route.ts  → API at "/api/notes"
    ├── checkout/
    │   └── route.ts  → API at "/api/checkout"
    └── webhooks/
        └── dodopayments/
            └── route.ts  → API at "/api/webhooks/dodopayments"
```

You literally just CREATE A FILE and the route exists. No registration needed.

---

## 5. The old way vs the new way

### Building websites: then vs now

```
THE OLD WAY (pre-2015, still common)
═════════════════════════════════════

Separate teams, separate codebases:

  Frontend (HTML/CSS/JS)     ←──── completely separate code
  Backend (PHP/Python/Java)  ←──── completely separate code
  
  Flow: Browser requests page → Backend generates HTML → Browser shows it
  
  Problems:
  - Two different languages, two different teams
  - "Full page reload" for every action (slow, jarring)
  - API had to be built separately if you wanted mobile apps later


THE NEW WAY (React/Next.js, 2020+)
═══════════════════════════════════

One codebase, one language (TypeScript), handles everything:

  "use client" components → runs in browser (interactive UI)
  Route files (route.ts)  → runs on server (API + data)
  Page files (page.tsx)   → can be server OR client, you choose per component
  
  Flow: Server sends initial HTML → Browser adds interactivity → 
        subsequent actions are fast "partial updates" not full page reloads
  
  Benefits:
  - One language for everything
  - Same codebase for web and API
  - Better performance (server sends pre-built HTML, browser enhances it)
  - TypeScript catches bugs before you ship
```

### Authentication: then vs now

```
THE OLD WAY (sessions)
═══════════════════════
1. User sends username + password
2. Server checks against database
3. Server creates a "session" record: { sessionId: "abc123", userId: 42 }
4. Server stores this in ITS OWN database
5. Browser gets back a cookie with just the sessionId
6. Every request: browser sends sessionId → server looks it up → finds the user

Problems: Server must store ALL sessions. If you have 1M users logged in = 1M database rows.
          If you have multiple servers, they all need access to the same session database.


THE NEW WAY (JWT — JSON Web Tokens, used here)
══════════════════════════════════════════════
1. User signs in with Google (no password stored by us!)
2. Firebase issues a signed token (JWT) containing: { uid: "abc", email: "...", exp: ... }
3. Token is SIGNED by Firebase's private key — cannot be faked
4. Browser stores token in a cookie
5. Every request: browser sends token → server VERIFIES THE SIGNATURE (no database lookup!)

Benefits: Server is stateless — doesn't store anything. 
          Works across multiple servers with no shared state.
          Google handles the password complexity.
```

### Database: then vs now

```
THE OLD WAY (SQL databases — MySQL, PostgreSQL)
════════════════════════════════════════════════
Tables with fixed columns, like a spreadsheet:

  users table:
  ┌────┬──────────────────┬─────────┐
  │ id │ email            │ plan    │
  ├────┼──────────────────┼─────────┤
  │  1 │ alice@gmail.com  │ free    │
  │  2 │ bob@gmail.com    │ premium │
  └────┴──────────────────┴─────────┘

  notes table:
  ┌────┬─────────┬───────────────┐
  │ id │ user_id │ text          │
  ├────┼─────────┼───────────────┤
  │  1 │       1 │ "Buy milk"    │
  │  2 │       1 │ "Call dentist"│
  └────┴─────────┴───────────────┘

Must define schema (columns) upfront. Every row has same shape.
Good for complex queries with joins.


THE NEW WAY (NoSQL / Firestore, used here)
══════════════════════════════════════════
Collections of documents, like Python dictionaries nested inside lists:

  "users" collection:
    document "uid_abc123": { email: "alice@gmail.com", plan: "free" }
    document "uid_def456": { email: "bob@gmail.com",   plan: "premium" }

  "notes" collection:
    document "note_111": { userId: "uid_abc123", text: "Buy milk", createdAt: "..." }
    document "note_222": { userId: "uid_abc123", text: "Call dentist", createdAt: "..." }

No fixed schema. Each document can have different fields.
Great for flexible data that changes shape over time.
Real-time sync built in. Scales automatically.
```

---

## 6. Every file in this project explained

```
micro-startup-app/
│
├── app/                          ← URL ROUTES (pages + API endpoints)
│   │
│   ├── page.tsx                  ← The home page (URL: "/")
│   │                               Server Component — no "use client"
│   │                               Shows the AuthButton (sign in/out)
│   │
│   ├── layout.tsx                ← The shell wrapping EVERY page
│   │                               Like a Python decorator that wraps all functions
│   │                               Sets the <html> tag, imports global CSS
│   │
│   ├── globals.css               ← Global styles (Tailwind CSS setup)
│   │                               You won't need to edit this
│   │
│   ├── notes/
│   │   └── page.tsx              ← The notes page (URL: "/notes")
│   │                               Server Component shell — renders NotesList
│   │
│   └── api/                      ← API ENDPOINTS (run on server, never in browser)
│       │
│       ├── notes/
│       │   └── route.ts          ← GET /api/notes  (fetch notes)
│       │                           POST /api/notes (create a note)
│       │
│       ├── checkout/
│       │   └── route.ts          ← POST /api/checkout
│       │                           Starts a Dodopayments session → returns checkout URL
│       │
│       └── webhooks/
│           └── dodopayments/
│               └── route.ts      ← POST /api/webhooks/dodopayments
│                                   Called BY Dodopayments after a successful payment
│                                   Upgrades the user's plan in the database
│
├── components/                   ← REUSABLE UI PIECES (interactive, run in browser)
│   │
│   ├── AuthButton.tsx            ← "Sign in with Google" / "Sign out" button
│   │                               "use client" — uses React state and browser APIs
│   │                               Handles the entire login/logout flow
│   │
│   └── NotesList.tsx             ← The notes list + add form + upgrade button
│                                   "use client" — fetches data, manages state
│                                   The main interactive part of the app
│
├── lib/                          ← SHARED UTILITIES (server-side only)
│   │
│   ├── firebase-client.ts        ← Sets up Firebase SDK for the BROWSER
│   │                               Used by: AuthButton.tsx
│   │                               Contains: public config only (safe to expose)
│   │
│   ├── firebase-admin.ts         ← Sets up Firebase Admin SDK for the SERVER
│   │                               Used by: auth-server.ts, firestore.ts
│   │                               Contains: service account key (SECRET — never expose)
│   │
│   ├── auth-server.ts            ← verifyUser() function
│   │                               Reads the authToken cookie from a request
│   │                               Verifies the JWT signature
│   │                               Returns the user's uid (or throws if invalid)
│   │
│   └── firestore.ts              ← All database operations in one place
│                                   createNote(), getNotesForUser(), setUserPlan()
│                                   Think of this as your "data layer" or "repository"
│
├── firestore.rules               ← DATABASE ACCESS RULES
│                                   Deployed to Firebase's servers (not your server)
│                                   Controls who can read/write what, as a last line of defense
│
├── .env.example                  ← Template showing what secrets/config this app needs
│                                   Copy this to .env.local and fill in your values
│                                   .env.local is in .gitignore — NEVER commit it
│
├── package.json                  ← Like requirements.txt for Node.js
│                                   Lists all dependencies (libraries)
│                                   Contains npm scripts (npm run dev, npm run build)
│
├── tsconfig.json                 ← TypeScript configuration
│                                   Tells TypeScript how strict to be, what paths mean, etc.
│                                   You generally don't need to touch this
│
└── next.config.ts                ← Next.js configuration
                                    You generally don't need to touch this
```

---

## 7. How users talk to servers: HTTP and APIs

### HTTP — the language of the web

Every interaction between browser and server is an HTTP message. There are different "verbs" (called methods) that indicate the intention:

```
HTTP METHODS (verbs)
═════════════════════
GET    → "give me data"      (reading notes, loading a page)
POST   → "here's new data"   (creating a note, starting checkout)
PUT    → "replace this data" (editing a note)
DELETE → "remove this"       (deleting a note)

Python analogy: these are like CRUD operations
  GET    = Read   (SELECT in SQL)
  POST   = Create (INSERT in SQL)
  PUT    = Update (UPDATE in SQL)
  DELETE = Delete (DELETE in SQL)
```

### What an HTTP request looks like

```
REQUEST (browser → server):
───────────────────────────────────────────────────────
POST /api/notes HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Cookie: authToken=eyJhbGciOiJSUzI1NiJ9...

{"text": "Buy milk"}

───────────────────────────────────────────────────────
   ↑          ↑              ↑                  ↑
  verb       path          headers           body (data)


RESPONSE (server → browser):
───────────────────────────────────────────────────────
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "note_abc123"}

───────────────────────────────────────────────────────
    ↑              ↑              ↑
  status         headers        body (data)
```

### Status codes — server's shorthand replies

```
2xx = Success
  200 OK              → worked fine
  201 Created         → created something new

4xx = Your fault (client error)
  400 Bad Request     → you sent invalid data
  401 Unauthorized    → not logged in / invalid token
  403 Forbidden       → logged in but not allowed (wrong user)
  404 Not Found       → that URL doesn't exist

5xx = Our fault (server error)
  500 Internal Error  → server crashed / bug in our code
```

### What is an API?

API stands for **Application Programming Interface**. In web terms, it's the set of URL+method combinations your server accepts.

This app's API:
```
GET  /api/notes            → returns list of notes for logged-in user
POST /api/notes            → creates a new note
POST /api/checkout         → starts a payment session
POST /api/webhooks/...     → receives payment confirmation from Dodopayments
```

Think of the API as the "menu" of things you can ask the server to do.

### Python analogy for API routes

```python
# Flask (Python) API — same concept as Next.js API routes
from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/api/notes', methods=['GET'])
def get_notes():
    user = verify_token(request.cookies.get('authToken'))
    notes = db.query("SELECT * FROM notes WHERE userId = ?", user.uid)
    return jsonify({"notes": notes})

@app.route('/api/notes', methods=['POST'])
def create_note():
    user = verify_token(request.cookies.get('authToken'))
    text = request.json['text']
    db.execute("INSERT INTO notes ...", user.uid, text)
    return jsonify({"id": new_id})
```

```typescript
// Next.js — same thing, different syntax
// app/api/notes/route.ts

export async function GET(req: NextRequest) {
    const uid = await verifyUser(req);   // same as verify_token
    const notes = await getNotesForUser(uid);  // same as db.query
    return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
    const uid = await verifyUser(req);
    const { text } = await req.json();
    const id = await createNote(uid, text);
    return NextResponse.json({ id });
}
```

---

## 8. Authentication: who are you?

### The problem authentication solves

Without auth, every user can see every other user's data. Auth answers: "Prove who you are before I give you anything."

### This app's auth flow, step by step

```
STEP 1: User clicks "Sign in with Google"
══════════════════════════════════════════════════════════════════════════
Browser (AuthButton.tsx)
  └── signInWithPopup(googleProvider)
        └── Opens a Google popup window
              └── User approves "This app wants to see your profile"
                    └── Google returns a "Google token" to Firebase
                          └── Firebase exchanges it for a "Firebase token" (JWT)
                                └── We get: result.user
                                └── We call: result.user.getIdToken()
                                └── We get: a JWT string (eyJhbGci...)


STEP 2: Store the token in a cookie
══════════════════════════════════════════════════════════════════════════
document.cookie = `authToken=${token}; path=/; max-age=3600; samesite=strict`

Why a cookie (not localStorage)?
  localStorage: you must manually add "Authorization: Bearer eyJ..." header to every fetch()
  Cookie:        browser automatically attaches it to every same-origin request ← simpler

Why samesite=strict?
  Prevents CSRF attacks — the cookie won't be sent if the request comes from
  a different website trying to trick your browser into making requests.

Why max-age=3600?
  Token expires in 1 hour. After that, user must sign in again.
  Firebase tokens have a 1-hour TTL (time-to-live) built in.


STEP 3: Every API call is verified
══════════════════════════════════════════════════════════════════════════
Browser makes any request (fetch("/api/notes"))
  └── Cookie is automatically attached: authToken=eyJhbGci...
        └── API route calls verifyUser(req)  [lib/auth-server.ts]
              └── Reads the cookie
                    └── Calls firebase-admin.verifyIdToken(token)
                          └── Firebase verifies the SIGNATURE (cryptographic check)
                                └── Returns: { uid: "abc123", email: "..." }
                                └── We now KNOW who this person is
```

### What is a JWT? (JSON Web Token)

A JWT is a self-contained proof of identity. It's a string that looks like:

```
eyJhbGciOiJSUzI1NiJ9.eyJ1aWQiOiJhYmMxMjMiLCJlbWFpbCI6InVzZXJAZ21haWwuY29tIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
         ↑                              ↑                                     ↑
      HEADER                         PAYLOAD                              SIGNATURE
  (algorithm used)             (the actual data)                  (cryptographic proof)
```

Each part is just base64-encoded (a way to encode any data as plain text).

Decode the PAYLOAD and you get:
```json
{
  "uid": "abc123",
  "email": "user@gmail.com",
  "exp": 1750000000,
  "iss": "https://securetoken.google.com/your-project"
}
```

The SIGNATURE is created by Firebase using their private key:
```
signature = sign(header + "." + payload, firebase_private_key)
```

To verify: we get Firebase's public key and check that the signature matches. If someone tampered with the payload (changed the uid), the signature won't match anymore. This means NO database lookup needed — pure cryptographic math.

```
Python analogy:
  # Like a signed document with a wax seal
  # Anyone can READ the document (payload is just base64)
  # But only the person with the private key could have SIGNED it
  # If you break the seal, you know the document was tampered with
```

---

## 9. The database: Firestore

### What Firestore is

Firestore is Google's managed NoSQL database. "Managed" means Google handles:
- Backups
- Scaling (handles 1 user or 1 million users the same way)
- Infrastructure (servers, storage)
- Security certificates

You just read and write data. You never manage a database server.

### The data structure

```
Firestore organizes data as: Collections → Documents → Fields

COLLECTIONS are like tables (or Python dicts of dicts):
  "users"  collection  ←── like a Python dict called "users"
  "notes"  collection  ←── like a Python dict called "notes"

DOCUMENTS are individual records (like Python dicts):
  users["uid_abc123"] = { email: "alice@gmail.com", plan: "free" }
  users["uid_def456"] = { email: "bob@gmail.com",   plan: "premium" }

FIELDS are the key-value pairs inside a document:
  email: "alice@gmail.com"
  plan: "free"
  createdAt: Timestamp(2024-01-15)
```

### Python analogy

```python
# If Firestore were a Python dict:
firestore_db = {
    "users": {
        "uid_abc123": {"email": "alice@gmail.com", "plan": "free"},
        "uid_def456": {"email": "bob@gmail.com",   "plan": "premium"},
    },
    "notes": {
        "note_111": {"userId": "uid_abc123", "text": "Buy milk", "createdAt": "..."},
        "note_222": {"userId": "uid_abc123", "text": "Call dentist", "createdAt": "..."},
        "note_333": {"userId": "uid_def456", "text": "Pay rent", "createdAt": "..."},
    }
}

# Reading notes for a user:
def get_notes_for_user(uid):
    return [
        note for note in firestore_db["notes"].values()
        if note["userId"] == uid
    ]
```

### The two Firebase SDKs (this is important)

There are TWO different ways to talk to Firestore, with completely different rules:

```
SDK 1: firebase (the client/browser SDK)
  File: lib/firebase-client.ts
  Used in: AuthButton.tsx (browser)
  Credentials: PUBLIC config (safe to expose)
  Rules: Firestore Security Rules ARE enforced — users can only access what rules allow
  Use case: Sign in/out, trigger re-auth

SDK 2: firebase-admin (the server SDK)
  File: lib/firebase-admin.ts
  Used in: auth-server.ts, firestore.ts (server only)
  Credentials: SERVICE ACCOUNT KEY (secret — like a root password)
  Rules: Firestore Security Rules are BYPASSED — full access to everything
  Use case: Verify tokens, read/write any data securely
```

Why two? Because on the server you TRUST the code (you wrote it). On the browser you DON'T trust it (the user could run anything). So browser calls go through rules, server calls bypass them.

---

## 10. Payments and webhooks

### The payment flow

This app uses Dodopayments for handling money. The key insight: **we never handle card numbers or payment details**. That's Dodopayments' job.

```
THE PAYMENT FLOW
═════════════════════════════════════════════════════════════════════════════

[1] User clicks "Upgrade to premium"
    Browser → POST /api/checkout

[2] Our server asks Dodopayments to create a checkout session
    Server → Dodopayments API
    Request: { product_id: "...", customer: { uid: "abc123" } }
    Response: { checkout_url: "https://pay.dodopayments.com/checkout/xyz" }

[3] We return the URL to the browser
    Browser redirects to: https://pay.dodopayments.com/checkout/xyz

[4] User is now ON DODOPAYMENTS' WEBSITE
    They enter their card details there
    We never see the card number — Dodopayments handles it
    (This is why it's a "hosted checkout session")

[5] Payment succeeds
    Dodopayments sends a POST request to:
    https://YOUR-APP.com/api/webhooks/dodopayments
    This is called a WEBHOOK

[6] Our webhook route receives the event
    Verifies it's really from Dodopayments (HMAC check)
    Upgrades the user's plan in Firestore
    Returns 200 OK to Dodopayments

═════════════════════════════════════════════════════════════════════════════
```

### What is a webhook?

Normal web flow: YOUR code calls SOMEONE ELSE's server when something happens.

Webhook: SOMEONE ELSE's server calls YOUR code when something happens.

```
NORMAL API CALL (you initiate):
  Your app → "Did anything happen?" → External service
  Your app ← "Here's what happened" ← External service
  (You have to POLL — check repeatedly)

WEBHOOK (they initiate):
  External service → "Something just happened!" → Your app
  External service ← "Got it, thanks (200 OK)" ← Your app
  (They PUSH to you — no polling needed)
```

Think of it like:
- Normal API = checking your email inbox every 5 minutes
- Webhook = getting an email notification when a new message arrives

### HMAC signature verification — preventing fake events

The webhook URL is public. Anyone on the internet could POST to it:
```
https://yourapp.com/api/webhooks/dodopayments
```

Without verification, an attacker could send:
```json
{ "type": "payment.succeeded", "data": { "customer_reference": "uid_abc123" } }
```
...and get a free premium upgrade.

HMAC prevents this:

```
THE SHARED SECRET APPROACH
═══════════════════════════════════════════════════════════
When you set up Dodopayments webhooks, you get a SECRET KEY.
Only YOU (in your .env.local) and DODOPAYMENTS know this key.

When Dodopayments sends a webhook:
  1. They compute: signature = HMAC-SHA256(secret_key, request_body)
  2. They attach it as a header: dodo-signature: "abc123def456..."
  3. They send the request

When your server receives the webhook:
  1. You compute:  expected = HMAC-SHA256(secret_key, request_body)
  2. You compare:  if signature == expected → authentic
                   if signature != expected → REJECT (fake)

An attacker doesn't know the secret key, so they can't compute a valid signature.
If they change even ONE character of the body, the signature won't match.
```

```
Python analogy:
  import hmac, hashlib
  
  def verify_webhook(body: str, received_signature: str, secret: str) -> bool:
      expected = hmac.new(
          secret.encode(),
          body.encode(),
          hashlib.sha256
      ).hexdigest()
      return hmac.compare_digest(expected, received_signature)
```

---

## 11. Security: the two layers

For every database operation, there are two independent checks. Either one failing blocks the operation.

```
REQUEST TO /api/notes
        ↓
┌─────────────────────────────────────────────────┐
│  LAYER 1: API Route (app/api/notes/route.ts)    │
│                                                  │
│  verifyUser(req):                                │
│    - Is there an authToken cookie?  No → 401    │
│    - Is the JWT signature valid?    No → 401    │
│    - Has it expired?                Yes → 401   │
│    - Returns uid if all pass                     │
└─────────────────────┬───────────────────────────┘
                      ↓ (only if Layer 1 passes)
         Firestore Admin SDK write
                      ↓
┌─────────────────────────────────────────────────┐
│  LAYER 2: Firestore Rules (firestore.rules)     │
│  (only applies to CLIENT SDK calls, not Admin)  │
│                                                  │
│  For notes: userId == request.auth.uid?         │
│    No → REJECT                                  │
│    Yes → ALLOW                                  │
│                                                  │
│  For users: allow write: if false               │
│    Always → REJECT (browser can never write)    │
│    Only Admin SDK can write here                │
└─────────────────────────────────────────────────┘

WHY TWO LAYERS?
  Layer 1 protects: our API routes from unauthorized calls
  Layer 2 protects: if someone bypasses Layer 1 and calls Firestore directly from browser
  
  Belt AND suspenders. One fails? The other catches it.
```

---

## 12. The complete user journey, step by step

### Journey 1: First visit and sign-in

```
1. User opens https://yourapp.com/
   Browser → GET / → Server renders app/page.tsx → HTML sent to browser

2. User sees homepage with "Sign in with Google" button

3. User clicks the button (AuthButton.tsx handleLogin runs)
   signInWithPopup() → Google OAuth popup opens

4. User approves the Google permissions

5. Firebase gives browser a JWT token
   token = await result.user.getIdToken()

6. Token stored in cookie:
   authToken=eyJhbGci...; max-age=3600; samesite=strict

7. Browser redirects to /notes

8. Server renders app/notes/page.tsx → HTML sent to browser

9. NotesList.tsx mounts in browser → useEffect runs → loadNotes() called

10. Browser → GET /api/notes (cookie attached automatically)
    Server verifies JWT → queries Firestore → returns notes[]

11. User sees their notes (empty on first visit)
```

### Journey 2: Creating a note

```
1. User types "Buy milk" in the input box
   setText("Buy milk") → React re-renders input with new value

2. User presses Enter or clicks "Add"
   handleAdd() runs

3. Browser → POST /api/notes with body: {"text": "Buy milk"}
   (authToken cookie attached automatically)

4. API route:
   verifyUser(req) → uid = "abc123"
   createNote("abc123", "Buy milk") → writes to Firestore
   Returns: {"id": "note_xyz"}

5. loadNotes() called again → fresh list fetched → UI updates
```

### Journey 3: Upgrading to premium

```
1. User clicks "Upgrade to premium"
   handleUpgrade() runs

2. Browser → POST /api/checkout
   (authToken cookie attached)

3. API route:
   verifyUser(req) → uid = "abc123"
   Calls Dodopayments API:
     { product_id: "...", customer_reference: "abc123" }
   Dodopayments returns: { checkout_url: "https://pay.dodopayments.com/..." }
   Returns: { checkout_url: "..." }

4. Browser redirects to the Dodopayments-hosted payment page
   User is no longer on YOUR website

5. User enters their card details on Dodopayments' secure page
   (You never see card numbers)

6. Payment succeeds

7. Dodopayments calls your webhook:
   POST https://yourapp.com/api/webhooks/dodopayments
   Body: { type: "payment.succeeded", data: { customer_reference: "abc123" } }
   Header: dodo-signature: "computed_hmac_value"

8. Your webhook route:
   Reads raw body as text
   Computes expected HMAC signature
   Compares: matches? → proceed; doesn't match? → reject with 401

9. Upgrade the user:
   setUserPlan("abc123", "premium") → writes to Firestore users/abc123

10. Returns 200 OK to Dodopayments (confirms receipt)

11. Next time user loads the app, their plan is "premium"
```

---

## 13. How to implement this, start to finish

### What you need before starting

- Node.js installed (comes with `npm`) — check with `node --version`
- A Google account (for Firebase)
- A Dodopayments account (for payments — sign up when ready for Phase 3)
- Basic terminal/command-line familiarity

### Phase 1: Get it running locally (10 minutes)

```bash
# 1. Go to the project folder
cd /Users/rajeshkohli/Documents/micro-startup-app

# 2. Install all dependencies (like pip install -r requirements.txt)
npm install

# 3. Start the development server
npm run dev

# 4. Open http://localhost:3000 in your browser
```

The app loads. "Sign in with Google" button is there, but clicking it will fail — we haven't connected Firebase yet. That's next.

### Phase 2: Connect Firebase (auth + database) (~30 minutes)

**Step 1: Create a Firebase project**
1. Go to https://console.firebase.google.com
2. Click "Create a project" → give it a name → click through

**Step 2: Enable Google sign-in**
1. In your Firebase project: Build → Authentication → Get started
2. Sign-in methods tab → Google → Enable → Save

**Step 3: Create a Firestore database**
1. Build → Firestore Database → Create database
2. Choose "Start in production mode" → Next
3. Pick a region (e.g., `us-central1`) → Enable

**Step 4: Get your web app config**
1. Project Settings (gear icon, top left) → General tab
2. Scroll down to "Your apps" → click `</>` (web)
3. Register app → you'll see a `firebaseConfig` object with these values:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "yourproject.firebaseapp.com",
     projectId: "yourproject-12345",
     storageBucket: "yourproject.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

**Step 5: Create your .env.local file**
```bash
# In terminal, from the project folder:
cp .env.example .env.local
```
Open `.env.local` and fill in the values from Step 4:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=yourproject-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=yourproject.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```
Why `NEXT_PUBLIC_`? That prefix tells Next.js "this value is safe to expose to the browser."
Values WITHOUT that prefix stay server-only (your secrets like the service account key).

**Step 6: Get the service account key (server secret)**
1. Project Settings → Service accounts tab
2. Click "Generate new private key" → download the JSON file
3. Open the downloaded JSON file — it looks like:
   ```json
   {
     "type": "service_account",
     "project_id": "yourproject",
     "private_key_id": "abc123",
     "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...",
     ...
   }
   ```
4. Copy the ENTIRE content of this JSON and paste it on ONE LINE as:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"yourproject",...}
   ```

**Step 7: Deploy Firestore security rules**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login with your Google account
firebase login

# Connect this folder to your Firebase project
firebase use --add
# (select your project from the list)

# Deploy the rules
firebase deploy --only firestore:rules
```

**Step 8: Restart and test**
```bash
# Restart the dev server (stop with Ctrl+C, then:)
npm run dev
```
Go to http://localhost:3000 → click "Sign in with Google" → it should work!

Try creating notes — they should appear immediately.

**Step 9: Also add to .env.local:**
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Phase 3: Connect payments (when ready for monetization)

**Step 1: Sign up at Dodopayments**
1. Create an account and a product (your premium plan)
2. Note the product ID (looks like `prd_abc123`)

**Step 2: Add to .env.local:**
```
DODO_API_KEY=your_api_key_here
DODO_PREMIUM_PRODUCT_ID=prd_abc123
```

**Step 3: Test with the test environment first**
Dodopayments has a sandbox/test mode — use test card numbers to verify the flow works before going live.

**Step 4: Set up the webhook (after deploying)**
1. You need a public URL — webhooks can't reach localhost
2. For local testing: use a tunnel tool like `ngrok`:
   ```bash
   ngrok http 3000
   # gives you: https://abc123.ngrok.io
   ```
3. In Dodopayments dashboard: Webhooks → Add endpoint → `https://abc123.ngrok.io/api/webhooks/dodopayments`
4. Copy the signing secret → add to `.env.local`:
   ```
   DODO_WEBHOOK_SECRET=whsec_abc123...
   ```

### Phase 4: Deploy to the internet

**Option A: Vercel (easiest — designed for Next.js)**
```bash
npm install -g vercel
vercel
# Follow the prompts — deploys automatically
# Then add your env vars in the Vercel dashboard
```

**Option B: Google Cloud Run**
```bash
gcloud auth login
gcloud config set project YOUR_FIREBASE_PROJECT_ID

gcloud run deploy micro-startup-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_API_KEY=...,NEXT_PUBLIC_APP_URL=https://YOUR-DEPLOYED-URL"
```
Use Google Cloud Secret Manager for the sensitive keys (FIREBASE_SERVICE_ACCOUNT_KEY, DODO_*).

### What to build next (once the basics work)

In rough priority order:

1. **Delete notes** — add `DELETE /api/notes/[id]/route.ts` + delete button in NotesList.tsx
2. **Show premium features** — add `GET /api/me` to return user's plan; gate features in UI
3. **HttpOnly cookie** — more secure auth token storage (needs a `/api/login` API route)
4. **Rate limiting** — prevent one user from spamming 1000 notes
5. **Loading/error states** — better UX when network is slow or fails
6. **Email on signup** — use a transactional email service (Resend, Postmark)

---

## 14. Jargon glossary

| Term | What it means |
|------|--------------|
| **API** | Application Programming Interface — the set of URLs your server accepts requests at |
| **API route** | A server-side function that handles requests at a URL (e.g., `/api/notes`) |
| **App Router** | Next.js's current system where folder structure = URL routes |
| **Authentication / Auth** | Proving who you are (login) |
| **Authorization** | Proving you're allowed to do something (access control) |
| **Base64** | A way to encode binary data as readable text. JWTs use it. |
| **Client Component** | A React component marked `"use client"` — runs in the browser |
| **Client-side** | Code/logic that runs in the browser (on the user's computer) |
| **Component** | A reusable UI piece (a button, a form, a list) — returns HTML-like markup |
| **Cookie** | A small piece of data the browser stores and automatically sends with requests |
| **CORS** | Cross-Origin Resource Sharing — security policy about which websites can call your API |
| **CRUD** | Create, Read, Update, Delete — the four basic database operations |
| **CSRF** | Cross-Site Request Forgery — an attack where a malicious site tricks your browser into making requests to another site. `samesite=strict` cookies prevent it. |
| **Dependency** | A library your code relies on (listed in `package.json`) |
| **Deployment** | Publishing your app to a server so others can use it |
| **Environment variable** | A configuration value passed to your app outside of code (secrets, API keys) |
| **Firebase** | Google's platform providing auth, database (Firestore), hosting, and more |
| **Firebase Admin SDK** | Server-only Firebase library — bypasses security rules, has full access |
| **Firestore** | Google's cloud NoSQL database (part of Firebase) |
| **Framework** | Pre-built code that handles boilerplate, letting you focus on your app logic |
| **GET** | HTTP method for "give me data" — like a function call that returns something |
| **HMAC** | Hash-based Message Authentication Code — a way to verify a message is authentic using a shared secret |
| **Hook** | A React function starting with `use` that adds capabilities to components (e.g., `useState`, `useEffect`) |
| **HTTP** | HyperText Transfer Protocol — the language browsers and servers use to communicate |
| **HttpOnly** | A cookie flag that prevents JavaScript from reading the cookie — more secure |
| **JSON** | JavaScript Object Notation — a data format like Python dicts, used everywhere on the web |
| **JSX / TSX** | JavaScript/TypeScript files that contain HTML-like markup for building UIs |
| **JWT** | JSON Web Token — a signed, self-contained proof of identity (used for auth) |
| **Middleware** | Code that runs between a request arriving and your handler handling it |
| **Next.js** | A React framework for building full-stack web apps (both UI and API server) |
| **Node.js** | JavaScript runtime for the server (like CPython is the runtime for Python) |
| **NoSQL** | A database type that stores documents (dicts) instead of rows in tables |
| **npm** | Node Package Manager — like `pip` but for JavaScript/TypeScript |
| **OAuth** | A standard for "sign in with X" flows (Google, GitHub, etc.) — you never handle passwords |
| **POST** | HTTP method for "here's new data, do something with it" |
| **React** | A JavaScript library for building UIs with reusable components |
| **REST** | Representational State Transfer — an architectural style for APIs using HTTP methods |
| **Route** | A URL path mapped to a handler function |
| **SameSite** | A cookie attribute controlling when the cookie is sent with cross-origin requests |
| **Server Component** | A Next.js component that runs ONLY on the server — no browser APIs, no hooks |
| **Server-side** | Code/logic that runs on the server (hidden from users, can use secrets) |
| **Service Account** | A non-human account for server-to-server authentication (like a machine's identity) |
| **SHA-256** | A cryptographic hash function — turns any data into a fixed-length fingerprint |
| **Singleton** | A pattern ensuring only one instance of something is created (used for Firebase initialization) |
| **SQL** | Structured Query Language — language for relational databases (MySQL, PostgreSQL) |
| **State** | Data that changes over time in a React component; when state changes, the UI re-renders |
| **TypeScript** | JavaScript with type annotations — like Python with required type hints, compiled to JS |
| **uid** | User ID — a unique string Firebase assigns to each user (e.g., `"abc123xyz"`) |
| **useEffect** | React hook for running code after a component renders (e.g., fetching data on load) |
| **useState** | React hook for storing changing values in a component (triggers re-render when updated) |
| **Webhook** | A URL you expose so an external service can notify your app when something happens |
| **XSS** | Cross-Site Scripting — an attack where malicious JavaScript is injected into your page |

---

*Last updated: July 2026*
*Project: micro-startup-app — Next.js + Firebase + Dodopayments scaffold*
