"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const uid = result.user.uid;
      const artistRef = doc(db, "artists", uid);
      const artistSnap = await getDoc(artistRef);

      onClose();

      if (artistSnap.exists()) {
        router.push(`/artist/${uid}`);
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
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b10] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 grid place-items-center">
              <div className="absolute inset-0 rounded-xl bg-purple-500/25 blur-xl animate-pulse" />
              <div className="relative z-10 h-12 w-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden grid place-items-center animate-float-slow">
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
              <p className="text-xs text-white/60">
                Welcome to ALOSMusic
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          {user ? (
            <>
              <p className="text-sm text-white/70">Logged in as</p>

              <p className="mt-1 font-medium break-all">
                {user.email || user.displayName || "Signed in user"}
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  onClick={() => {
                    onClose();
                    router.push("/artist/setup");
                  }}
                  className="w-full rounded-xl bg-purple-600 py-2.5 font-semibold hover:bg-purple-500 transition duration-200"
                >
                  Artist Profile
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 font-semibold hover:bg-white/10 transition duration-200"
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
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-purple-600 py-2.5 font-semibold hover:bg-purple-500 transition duration-200 disabled:opacity-60"
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