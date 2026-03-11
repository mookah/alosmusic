"use client";

import React from "react";

type PremiumButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "brand" | "blue" | "ghost";
};

export default function PremiumButton({
  variant = "brand",
  className = "",
  children,
  ...props
}: PremiumButtonProps) {
  let baseStyle = "premium-button";

  if (variant === "blue") {
    baseStyle = "premium-button-blue";
  }

  if (variant === "ghost") {
    baseStyle =
      "rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition";
  }

  return (
    <button {...props} className={`${baseStyle} ${className}`}>
      {children}
    </button>
  );
}