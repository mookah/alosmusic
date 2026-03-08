"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import AuthModal from "./AuthModal";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

type AuthCtx = {
  openAuth: () => void;
  closeAuth: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({
      openAuth: () => setOpen(true),
      closeAuth: () => setOpen(false),
    }),
    []
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const refDoc = doc(db, "users", user.uid);
        const snap = await getDoc(refDoc);

        if (!snap.exists()) {
          await setDoc(refDoc, {
            uid: user.uid,
            name: user.displayName || "New Artist",
            email: user.email || "",
            bio: "",
            genre: "Gospel",
            location: "",
            photoURL: user.photoURL || "",
            coverURL: "",
            facebook: "",
            instagram: "",
            youtube: "",
            followersCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(
            refDoc,
            {
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      } catch (error) {
        console.error("Failed to ensure user profile:", error);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </AuthContext.Provider>
  );
}