"use client";

import { useState } from "react";
import Topbar from "./Topbar";
import AuthModal from "./AuthModal";
import AuthProvider from "./AuthContext";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <AuthProvider>
      <Topbar onAuth={() => setAuthOpen(true)} />
      {children}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </AuthProvider>
  );
}