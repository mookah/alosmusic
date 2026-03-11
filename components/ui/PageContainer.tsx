"use client";

import React from "react";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* premium glow background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent_35%)]" />

      <div
        className={`mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 ${className}`}
      >
        {children}
      </div>

    </main>
  );
}