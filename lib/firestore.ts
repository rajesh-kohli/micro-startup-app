// All Firestore reads/writes live here, in one place, so the rest of the
// app never talks to Firestore directly — it calls these named functions.
// This is a small but useful habit: if you ever swap Firestore for Postgres
// later, this is the only file that has to change.

import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "./firebase-admin";

function db() {
  return getFirestore(getAdminApp());
}

export type Note = {
  id: string;
  text: string;
  userId: string;
  createdAt: string;
};

export async function createNote(uid: string, text: string) {
  const docRef = await db().collection("notes").add({
    text,
    userId: uid,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getNotesForUser(uid: string): Promise<Note[]> {
  const snapshot = await db()
    .collection("notes")
    .where("userId", "==", uid)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Note, "id">),
  }));
}

export async function deleteNote(uid: string, noteId: string) {
  const ref = db().collection("notes").doc(noteId);
  const snap = await ref.get();

  // Defense in depth, mirrored from the Firestore Security Rules:
  // never delete a document without confirming this user actually owns it.
  if (!snap.exists || snap.data()?.userId !== uid) {
    throw new Error("Not found or not authorized");
  }
  await ref.delete();
}

export async function setUserPlan(uid: string, plan: "free" | "premium") {
  await db().collection("users").doc(uid).set({ plan }, { merge: true });
}
