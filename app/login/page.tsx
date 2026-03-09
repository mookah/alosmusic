"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthLogo from "@/components/Brand/AuthLogo";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      const code = err?.code || "";

      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found" ||
        code === "auth/invalid-email"
      ) {
        setError("Incorrect email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Could not log in right now.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      const code = err?.code || "";

      if (code === "auth/popup-closed-by-user") {
        setError("Google sign-in was closed before finishing.");
      } else if (code === "auth/account-exists-with-different-credential") {
        setError("This email is already linked to another sign-in method.");
      } else {
        setError("Google login failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.14),transparent_28%)]" />
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-start justify-center px-6 pb-40 pt-14 md:items-center md:pb-28 md:pt-10">
        <div className="w-full max-w-[460px]">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-block">
              <AuthLogo />
            </Link>

            <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-fuchsia-300/70">
              Premium Gospel Streaming
            </p>

            <h1 className="text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl">
              Log in to
              <br />
              keep listening
            </h1>

            <p className="mt-4 text-sm text-white/60">
              Welcome back to ALOSMusic.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-white/15 bg-black/50 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-500"
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
                  className="h-14 w-full rounded-2xl border border-white/15 bg-black/50 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-500"
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
                className="h-14 w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 text-base font-bold text-white transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-sm text-white/45">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-transparent px-5 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-base">G</span>
              Continue with Google
            </button>

            <p className="mt-5 text-center text-sm text-white/55">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-fuchsia-400 hover:text-fuchsia-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}