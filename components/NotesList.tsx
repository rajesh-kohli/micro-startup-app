"use client";

// "use client" marks this as a Client Component. It means this file's code
// runs IN THE BROWSER and can use React hooks (useState, useEffect) and
// browser APIs (fetch, window). Server Components cannot do any of that.
//
// Data flow in this component:
//   Browser (this component) → GET /api/notes → verifyUser() → Firestore → notes[]
//   Browser (this component) → POST /api/notes → verifyUser() → Firestore → note saved
//   Browser (this component) → POST /api/checkout → verifyUser() → Dodopayments API → checkout_url
//
// The authToken cookie is attached to every fetch() call automatically by the
// browser because it shares the same origin (same host + port). That's the
// whole reason we store the JWT in a cookie rather than localStorage — cookies
// are sent with requests, localStorage is not.

import { useEffect, useState } from "react";

type Note = { id: string; text: string; createdAt: string };

export default function NotesList() {
  // React state: when any of these change, React re-renders just this component.
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    // fetch() sends the authToken cookie automatically (same-origin request).
    // The API route reads that cookie, verifies it, and returns only THIS user's notes.
    const res = await fetch("/api/notes");
    if (res.ok) {
      const data = await res.json();
      setNotes(data.notes);
    }
    setLoading(false);
  }

  // useEffect with an empty dependency array [] runs exactly once: after the
  // component first mounts in the browser. This is the standard pattern for
  // "fetch data on page load."
  useEffect(() => {
    loadNotes();
  }, []);

  async function handleAdd() {
    if (!text.trim()) return;
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      setText("");
      loadNotes(); // re-fetch to show the new note (simple polling; real apps use optimistic updates)
    }
  }

  async function handleUpgrade() {
    // We never handle payment details here. We just ask OUR server to start a
    // Dodopayments session, get back a URL, and redirect the browser there.
    // The full payment flow is:
    //   1. Browser → POST /api/checkout (our server)
    //   2. Our server → Dodopayments API → checkout_url
    //   3. Browser redirected to Dodopayments-hosted page (card details entered there)
    //   4. On success, Dodopayments hits our webhook → /api/webhooks/dodopayments
    //   5. Webhook upgrades the user's plan in Firestore
    const res = await fetch("/api/checkout", { method: "POST" });
    if (res.ok) {
      const { checkout_url } = await res.json();
      window.location.href = checkout_url; // hard redirect to the payment page
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="rounded-md border border-gray-200 px-3 py-2 text-sm">
            {note.text}
          </li>
        ))}
        {notes.length === 0 && (
          <p className="text-sm text-gray-400">No notes yet — add your first one above.</p>
        )}
      </ul>

      <button onClick={handleUpgrade} className="text-sm text-blue-600 underline">
        Upgrade to premium
      </button>
    </div>
  );
}
