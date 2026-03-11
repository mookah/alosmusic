"use client";

import React from "react";

type PremiumInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function PremiumInput({
  label,
  className = "",
  ...props
}: PremiumInputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm text-white/70">
          {label}
        </label>
      )}

      <input
        {...props}
        className={`premium-input ${className}`}
      />
    </div>
  );
}