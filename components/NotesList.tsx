"use client";

import { useEffect, useState } from "react";

type Note = { id: string; text: string; createdAt: string };

export default function NotesList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    const res = await fetch("/api/notes");
    if (res.ok) {
      const data = await res.json();
      setNotes(data.notes);
    }
    setLoading(false);
  }

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
      loadNotes(); // re-fetch to show the new note
    }
  }

  async function handleUpgrade() {
    const res = await fetch("/api/checkout", { method: "POST" });
    if (res.ok) {
      const { checkout_url } = await res.json();
      window.location.href = checkout_url;
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
