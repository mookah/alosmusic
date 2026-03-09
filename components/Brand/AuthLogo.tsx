"use client";

import Image from "next/image";

export default function AuthLogo() {
  return (
    <div className="relative mx-auto mb-6 w-fit animate-[float_4s_ease-in-out_infinite]">
      
      {/* soft glow */}
      <div className="absolute inset-0 blur-2xl opacity-30">
        <Image
          src="/logo.png"
          alt="ALOSMusic"
          width={120}
          height={120}
          className="object-contain"
        />
      </div>

      {/* main logo */}
      <Image
        src="/logo.png"
        alt="ALOSMusic"
        width={120}
        height={120}
        className="relative object-contain drop-shadow-[0_8px_30px_rgba(217,70,239,0.25)]"
        priority
      />

      {/* shimmer pass */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-full w-24 rotate-12 bg-white/10 blur-md animate-[shine_4s_linear_infinite]" />
      </div>

    </div>
  );
}