"use client";

import { useEffect, useState } from "react";
import Topbar from "./Site/Topbar";
import Sidebar from "./Site/Sidebar";
import AuthModal from "./Site/AuthModal";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authOpen, setAuthOpen] = useState(false);

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

      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar onAuth={() => setAuthOpen(true)} />

        <section className="min-w-0 flex-1 px-5 py-6">{children}</section>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  );
}