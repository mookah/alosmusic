"use client";

import React from "react";

type AuthMode = "signup" | "login";

type AuthTabsProps = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
  className?: string;
};

export default function AuthTabs({
  mode,
  onChange,
  className = "",
}: AuthTabsProps) {
  return (
    <div className={`mb-6 flex justify-center gap-3 border-b border-white/10 pb-4 ${className}`}>
      <button
        type="button"
        onClick={() => onChange("signup")}
        className={`px-4 py-2 rounded-full transition ${
          mode === "signup"
            ? "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white"
            : "text-white/70 hover:text-white"
        }`}
      >
        Sign up
      </button>

      <button
        type="button"
        onClick={() => onChange("login")}
        className={`px-4 py-2 rounded-full transition ${
          mode === "login"
            ? "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white"
            : "text-white/70 hover:text-white"
        }`}
      >
        Log in
      </button>
    </div>
  );
}