"use client";

import { useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import AuthModal from "./AuthModal";
import SiteFooter from "./SiteFooter";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";

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
    <main className="min-h-screen bg-black text-white">
      <div className="hidden md:block">
        <Topbar onAuth={() => setAuthOpen(true)} />
      </div>

      <MobileHeader onAuth={() => setAuthOpen(true)} />

      <div className="mx-auto flex w-full max-w-[1400px]">
        <aside className="hidden md:block md:w-[240px] md:shrink-0 xl:w-[248px]">
          <div className="sticky top-16 px-3 pt-3">
            <div className="h-[calc(100vh-150px)] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
              <Sidebar onAuth={() => setAuthOpen(true)} />
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-4 sm:px-5 md:px-6 md:py-6">
          {showTitle && (
            <div className="mb-4 flex items-center justify-between md:mb-5">
              <h1 className="text-lg font-semibold sm:text-xl md:text-2xl">
                {title}
              </h1>
            </div>
          )}

          <div className="pb-52 md:pb-40">{children}</div>

          <div className="pt-6">
            <SiteFooter />
          </div>
        </section>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <MobileBottomNav />
    </main>
  );
}