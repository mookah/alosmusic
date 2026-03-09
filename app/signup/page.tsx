"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthLogo from "@/components/Brand/AuthLogo";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"listener" | "artist">("listener");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);

      if (typeof window !== "undefined") {
        localStorage.setItem("alosmusic_account_type", accountType);
      }

      router.push(accountType === "artist" ? "/artist-profile" : "/");
    } catch (err: any) {
      setError(err?.message || "Could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      if (typeof window !== "undefined") {
        localStorage.setItem("alosmusic_account_type", accountType);
      }

      router.push(accountType === "artist" ? "/artist-profile" : "/");
    } catch (err: any) {
      setError(err?.message || "Google signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.16),transparent_26%)]" />
      <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <AuthLogo />
            </Link>

            <p className="-mt-1 mb-3 text-xs uppercase tracking-[0.35em] text-fuchsia-300/70">
              Premium Gospel Streaming
            </p>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Sign up to
              <br />
              start streaming
            </h1>

            <p className="mt-4 text-sm text-white/60">
              Create your ALOSMusic account to upload, discover, and enjoy gospel
              music.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-5">
              <p className="mb-3 text-sm font-medium text-white/85">
                Choose account type
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("listener")}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    accountType === "listener"
                      ? "border border-fuchsia-500/40 bg-fuchsia-500/15 text-white"
                      : "border border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]"
                  }`}
                >
                  Listener
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("artist")}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    accountType === "artist"
                      ? "border border-fuchsia-500/40 bg-fuchsia-500/15 text-white"
                      : "border border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]"
                  }`}
                >
                  Artist
                </button>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Confirm password
                </label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-500"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-3 text-base font-bold text-white transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Next"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-sm text-white/45">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-base">G</span>
                Sign up with Google
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-white/55">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-fuchsia-400 hover:text-fuchsia-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}