// app/upload/loading.tsx
import LogoLoader from "@/components/LogoLoader";

export default function Loading() {
  return (
    <main className="min-h-screen bg-black text-white grid place-items-center">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-10 py-8">
        <LogoLoader label="Preparing upload..." />
      </div>
    </main>
  );
}