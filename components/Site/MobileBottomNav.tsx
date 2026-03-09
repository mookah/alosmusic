"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Browse", href: "/browse", icon: "🎵" },
  { label: "Upload", href: "/upload", icon: "⬆️" },
  { label: "Profile", href: "/artist-profile", icon: "👤" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/95 backdrop-blur">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-3 text-[11px] transition ${
                active
                  ? "text-fuchsia-400"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}