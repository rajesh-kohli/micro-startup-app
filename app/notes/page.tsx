import AuthButton from "@/components/AuthButton";
import NotesList from "@/components/NotesList";

// This page's content depends on which user is signed in, so it can't be
// usefully pre-rendered to a single static HTML file at build time the way
// a marketing page could (recall the SSG vs SSR distinction) — it's
// rendered fresh per request instead.
export const dynamic = "force-dynamic";

// This page itself is a Server Component (no 'use client' here), so it's
// rendered to HTML on the server before reaching the browser. The
// interactive list below is a separate Client Component, deliberately
// isolated so only the parts that need JavaScript ship any.
export default function NotesPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your notes</h1>
        <AuthButton />
      </div>
      <NotesList />
    </main>
  );
}
