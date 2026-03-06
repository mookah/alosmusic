"use client";

import { useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import AuthModal from "./AuthModal";
import SiteFooter from "./SiteFooter";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";
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
      {/* Desktop topbar only */}
      <div className="hidden md:block">
        <Topbar onAuth={() => setAuthOpen(true)} />
      </div>

      {/* Mobile header only */}
      <MobileHeader onAuth={() => setAuthOpen(true)} />

      <div className="mx-auto max-w-[1400px] flex flex-1 w-full">
        {/* Desktop sidebar only */}
        <div className="hidden md:block">
          <Sidebar onAuth={() => setAuthOpen(true)} />
        </div>

        <section className="flex-1 min-w-0 px-4 py-4 sm:px-5 md:px-6 md:py-6 flex flex-col">
          {showTitle && (
            <div className="mb-4 md:mb-5 flex items-center justify-between">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">
                {title}
              </h1>
            </div>
          )}

          <div className="flex-1 pb-40 md:pb-32">{children}</div>

          <div className="pt-6">
            <SiteFooter />
          </div>
        </section>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Mobile bottom nav only */}
      <MobileBottomNav />

      {/* Global player */}
      <BottomPlayer />
    </main>
  );
}