"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase-client";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  async function ensureUserProfile(u: User) {
    const userRef = doc(db, "users", u.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        email: u.email || "",
        name: u.displayName || "",
        bio: "",
        photoURL: u.photoURL || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return false;
    }

    await setDoc(
      userRef,
      {
        email: u.email || snap.data()?.email || "",
        name: snap.data()?.name || u.displayName || "",
        photoURL: snap.data()?.photoURL || u.photoURL || "",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return true;
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const signedInUser = result.user;

      const hadProfileBefore = await ensureUserProfile(signedInUser);

      onClose();

      if (hadProfileBefore) {
        router.push(`/artist/${signedInUser.uid}`);
      } else {
        router.push("/artist/setup");
      }
    } catch (error) {
      console.error("Google sign-in failed:", error);
      alert("Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b10] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid h-12 w-12 place-items-center">
              <div className="absolute inset-0 animate-pulse rounded-xl bg-purple-500/25 blur-xl" />
              <div className="relative z-10 grid h-12 w-12 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5 animate-float-slow">
                <Image
                  src="/logo.png"
                  alt="ALOSMusic Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                {user ? "Your account" : "Sign in"}
              </h2>
              <p className="text-xs text-white/60">Welcome to ALOSMusic</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-lg text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          {user ? (
            <>
              <p className="text-sm text-white/70">Logged in as</p>

              <p className="mt-1 break-all font-medium">
                {user.email || user.displayName || "Signed in user"}
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/artist/setup");
                  }}
                  className="w-full rounded-xl bg-purple-600 py-2.5 font-semibold transition duration-200 hover:bg-purple-500"
                >
                  Artist Profile
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 font-semibold transition duration-200 hover:bg-white/10"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-white/70">
                Sign in to create your artist profile and upload songs.
              </p>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-purple-600 py-2.5 font-semibold transition duration-200 hover:bg-purple-500 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Continue with Google"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}