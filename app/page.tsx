import AuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">The micro-startup stack</h1>
      <p className="text-gray-600">
        Next.js + Firebase Auth + Firestore + Dodopayments, wired together
        end to end. Sign in to try the notes demo.
      </p>
      <AuthButton />
    </main>
  );
}
