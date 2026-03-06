"use client";

import { useEffect, useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import AuthModal from "./AuthModal";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authOpen, setAuthOpen] = useState(false);

  // ESC closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAuthOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Topbar onAuth={() => setAuthOpen(true)} />

      <div className="mx-auto max-w-[1400px] flex">
        <Sidebar onAuth={() => setAuthOpen(true)} />

        <section className="flex-1 min-w-0 px-5 py-6">{children}</section>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  );
}