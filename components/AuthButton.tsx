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
    // signInWithPopup opens Google's OAuth consent screen in a popup window.
    // When the user approves, Firebase exchanges the Google OAuth token for a
    // Firebase ID Token (a JWT — JSON Web Token) scoped to THIS app.
    const result = await signInWithPopup(getFirebaseAuth(), googleProvider);

    // getIdToken() returns the signed JWT that proves who this user is.
    // It's a base64-encoded string (looks like "eyJhbGci...") containing:
    //   header: { alg: "RS256", kid: "key_id" }
    //   payload: { uid: "abc123", email: "user@gmail.com", exp: 1234567890, ... }
    //   signature: signed by Firebase's private key (our server verifies with Firebase's public key)
    const token = await result.user.getIdToken();

    // We store the JWT in a cookie (not localStorage) because:
    //   - Cookies are automatically attached to same-origin fetch() calls → API routes see it
    //   - localStorage requires manual "Authorization: Bearer ..." header on every fetch
    //   - samesite=strict prevents the cookie being sent in cross-site requests (CSRF protection)
    //   - max-age=3600 → cookie expires in 1 hour (matching Firebase token TTL)
    // Note: HttpOnly would be better in production (prevents JS reading the cookie),
    // but requires a dedicated /api/login route to set it server-side.
    document.cookie = `authToken=${token}; path=/; max-age=3600; samesite=strict`;
    router.push("/notes");
    router.refresh(); // tells Next.js to re-render Server Components with fresh data
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
