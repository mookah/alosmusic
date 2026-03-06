"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import AuthModal from "./AuthModal";

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

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({
      openAuth: () => setOpen(true),
      closeAuth: () => setOpen(false),
    }),
    []
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </AuthContext.Provider>
  );
}