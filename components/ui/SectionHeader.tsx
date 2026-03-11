"use client";

import React from "react";
import BrandBadge from "./BrandBadge";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  badgeText?: string;
  className?: string;
};

export default function SectionHeader({
  title,
  subtitle,
  badgeText = "ALOSMUSIC",
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="inline-flex items-center gap-2">
        <BrandBadge text={badgeText} />
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
        {title}
      </h1>

      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm text-white/60 md:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}