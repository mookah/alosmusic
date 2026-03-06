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

      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        {/* Desktop sidebar only */}
        <div className="hidden md:block">
          <Sidebar onAuth={() => setAuthOpen(true)} />
        </div>

        <section className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-5 md:px-6 md:py-6 lg:px-8">
          {showTitle && (
            <div className="mb-4 flex items-center justify-between md:mb-5">
              <h1 className="text-lg font-semibold sm:text-xl md:text-2xl">
                {title}
              </h1>
            </div>
          )}

          {/* extra bottom padding so player does not cover content */}
          <div className="flex-1 pb-28 md:pb-32">{children}</div>

          <SiteFooter />
        </section>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Global player for ALL pages */}
      <BottomPlayer />
    </main>
  );
}