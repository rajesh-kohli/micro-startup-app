// API Route: /api/notes
// Handles GET (fetch all notes for the signed-in user) and POST (create a new note).
//
// Next.js App Router API routes work differently from pages/api/ (the old way):
//   - Each exported function name matches an HTTP method (GET, POST, PUT, DELETE…).
//   - They run on the SERVER, never in the browser — safe to use secrets here.
//   - The file lives at app/api/notes/route.ts → maps to the URL /api/notes.
//
// Every route here follows the same 3-step pattern:
//   Step 1: Verify the caller is a real, signed-in user (verifyUser)
//   Step 2: Do the work (read/write Firestore)
//   Step 3: Return a JSON response
// If Step 1 fails (token missing, expired, or forged), we immediately return 401
// and never even touch the database.

import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { createNote, getNotesForUser } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  try {
    // verifyUser() reads the authToken cookie, verifies the JWT signature,
    // and returns the Firebase UID (e.g. "abcd1234") — a stable, unique user ID.
    const uid = await verifyUser(req);

    // We only query notes WHERE userId == uid, so users can never see each other's data.
    const notes = await getNotesForUser(uid);
    return NextResponse.json({ notes });
  } catch {
    // Any failure in verifyUser (bad/missing token) lands here → 401 Unauthorized.
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUser(req);

    // req.json() parses the request body. We destructure just the `text` field.
    const { text } = await req.json();

    // Input validation at the API boundary — never trust data from the client.
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Note text is required" }, { status: 400 });
    }

    // createNote() writes to Firestore and stamps the note with this user's uid.
    // That uid is what the Security Rules (firestore.rules) later use to enforce
    // that only the owner can read/delete the note — two independent layers of protection.
    const id = await createNote(uid, text.trim());
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
