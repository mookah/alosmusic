"use client";

import { useState } from "react";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setSuccess("");

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setMessage("Email is required.");
      return;
    }

    if (!password.trim()) {
      setMessage("Password is required.");
      return;
    }

    if (mode === "signup" && !cleanName) {
      setMessage("Full name is required.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

        if (cleanName) {
          await updateProfile(cred.user, {
            displayName: cleanName,
          });
        }

        setSuccess("Account created successfully.");
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        setSuccess("Logged in successfully.");
      }

      window.location.href = "/";
    } catch (error: any) {
      const code = error?.code || "";

      if (code === "auth/email-already-in-use") {
        setMode("login");
        setMessage("This email already has an account. Please log in.");
      } else if (code === "auth/invalid-credential") {
        setMessage("Invalid email or password.");
      } else if (code === "auth/user-not-found") {
        setMessage("No account found with this email.");
      } else if (code === "auth/wrong-password") {
        setMessage("Incorrect password.");
      } else if (code === "auth/weak-password") {
        setMessage("Password should be at least 6 characters.");
      } else if (code === "auth/invalid-email") {
        setMessage("Please enter a valid email address.");
      } else if (code === "auth/missing-password") {
        setMessage("Password is required.");
      } else if (code === "auth/too-many-requests") {
        setMessage("Too many attempts. Please wait a bit and try again.");
      } else if (code === "auth/network-request-failed") {
        setMessage("Network error. Please check your internet connection.");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setMessage("");
    setSuccess("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage("Enter your email first, then tap Forgot password.");
      return;
    }

    try {
      setResetLoading(true);
      await sendPasswordResetEmail(auth, cleanEmail);
      setSuccess("Password reset email sent. Check your inbox.");
    } catch (error: any) {
      const code = error?.code || "";

      if (code === "auth/invalid-email") {
        setMessage("Please enter a valid email address.");
      } else if (code === "auth/user-not-found") {
        setMessage("No account found with that email.");
      } else if (code === "auth/too-many-requests") {
        setMessage("Too many attempts. Please wait and try again.");
      } else if (code === "auth/network-request-failed") {
        setMessage("Network error. Please check your internet connection.");
      } else {
        setMessage("Could not send reset email right now.");
      }
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-[540px] items-center justify-center">
        <div className="w-full">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-1 text-xs text-fuchsia-300">
              <img
                src="/logo.png"
                alt="ALOSMUSIC"
                className="h-5 w-5 object-contain"
              />
              ALOSMUSIC
            </div>

            <h1 className="mt-5 text-3xl font-bold text-white md:text-4xl">
              Welcome
            </h1>

            <p className="mt-3 text-sm text-white/60">
              Sign up or log in to continue enjoying music.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0c1428] px-6 py-7">
            <div className="mb-6 flex justify-center gap-3 border-b border-white/10 pb-4">
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setMessage("");
                  setSuccess("");
                }}
                className={`rounded-full px-4 py-2 transition ${
                  mode === "signup"
                    ? "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Sign up
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                  setSuccess("");
                }}
                className={`rounded-full px-4 py-2 transition ${
                  mode === "login"
                    ? "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Log in
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-[#243148] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
              )}

              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#243148] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-fuchsia-500"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-[#243148] px-4 py-3 pr-16 text-white outline-none focus:ring-2 focus:ring-fuchsia-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-white/65 transition hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {mode === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="text-sm text-fuchsia-300 transition hover:text-fuchsia-200 disabled:opacity-60"
                  >
                    {resetLoading ? "Sending reset link..." : "Forgot password?"}
                  </button>
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {message}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-70"
              >
                {loading
                  ? "Please wait..."
                  : mode === "signup"
                  ? "Create account"
                  : "Log in"}
              </button>

              <div className="text-center text-sm text-white/50">
                <Link href="/">Back to home</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}