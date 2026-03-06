"use client";

import { useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import AuthModal from "./AuthModal";
import SiteFooter from "./SiteFooter";
import BottomPlayer from "@/components/Player/BottomPlayer";

export default function SiteShell({
  title,
  children,
  showTitle = true,
}: {
  title: string;
  children: React.ReactNode;
  showTitle?: boolean;
}) {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Topbar onAuth={() => setAuthOpen(true)} />

      <div className="mx-auto max-w-[1400px] flex flex-1 w-full">
        <Sidebar onAuth={() => setAuthOpen(true)} />

        <section className="flex-1 min-w-0 px-5 py-6 flex flex-col">
          {showTitle && (
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
            </div>
          )}

          <div className="flex-1">{children}</div>

          <SiteFooter />
        </section>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* ✅ Global player for ALL pages */}
      <BottomPlayer />
    </main>
  );
}