"use client";

import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth, googleProvider } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Subscribes to Firebase's auth state — fires whenever login/logout happens,
  // including automatically on page load if a session already exists.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (u) => setUser(u));
    return unsubscribe;
  }, []);

  async function handleLogin() {
    const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
    const token = await result.user.getIdToken();

    // Store the JWT in a cookie so it's automatically sent with every
    // request to our own API routes (including Server Component fetches).
    document.cookie = `authToken=${token}; path=/; max-age=3600; samesite=strict`;
    router.push("/notes");
    router.refresh();
  }

  async function handleLogout() {
    await signOut(getFirebaseAuth());
    document.cookie = "authToken=; path=/; max-age=0";
    router.push("/");
    router.refresh();
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={handleLogout}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      Sign in with Google
    </button>
  );
}
