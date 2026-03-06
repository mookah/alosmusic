"use client";
import LogoEqualizer from "@/components/Brand/LogoEqualizer";
import Image from "next/image";
import { useEffect } from "react";

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Close modal with ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b10] p-6 shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            
            {/* LOGO WITH EFFECT */}
            <div className="relative h-12 w-12 grid place-items-center">

              {/* Glow */}
              <div className="absolute inset-0 rounded-xl bg-purple-500/25 blur-xl animate-pulse"></div>

              {/* Float wrapper */}
              <div className="relative z-10 h-12 w-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden grid place-items-center animate-float-slow">
                <Image
                  src="/logo.png"
                  alt="ALOSMusic Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Sign up</h2>
              <p className="text-xs text-white/60">
                Welcome to ALOSMusic
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/70">
            Logged in as
          </p>

          <p className="mt-1 font-medium break-all">
            innocentwino@gmail.com
          </p>

          <button className="mt-5 w-full rounded-xl bg-purple-600 py-2.5 font-semibold hover:bg-purple-500 transition duration-200">
            Sign out
          </button>
        </div>

      </div>
    </div>
  );
}