import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { createNote, getNotesForUser } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    const notes = await getNotesForUser(uid);
    return NextResponse.json({ notes });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Note text is required" }, { status: 400 });
    }

    const id = await createNote(uid, text.trim());
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
