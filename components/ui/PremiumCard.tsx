"use client";

import React from "react";

type PremiumCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PremiumCard({ children, className = "" }: PremiumCardProps) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-[#0c1428] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] ${className}`}
    >
      {children}
    </div>
  );
}