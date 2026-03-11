"use client";

import { useState } from "react";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setMessage("Email is required.");
      return;
    }

    if (!password.trim()) {
      setMessage("Password is required.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setMessage("Full name is required.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        if (name.trim()) {
          await updateProfile(cred.user, {
            displayName: name.trim(),
          });
        }

        setMessage("Account created successfully.");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setMessage("Logged in successfully.");
      }

      window.location.href = "/";
    } catch (error: any) {

      if (error?.code === "auth/email-already-in-use") {
        setMode("login");
        setMessage("This email already has an account. Please log in.");
      }

      else if (error?.code === "auth/invalid-credential") {
        setMessage("Invalid email or password.");
      }

      else if (error?.code === "auth/user-not-found") {
        setMessage("No account found with this email.");
      }

      else if (error?.code === "auth/wrong-password") {
        setMessage("Incorrect password.");
      }

      else if (error?.code === "auth/weak-password") {
        setMessage("Password should be at least 6 characters.");
      }

      else if (error?.code === "auth/invalid-email") {
        setMessage("Please enter a valid email address.");
      }

      else {
        setMessage("Something went wrong. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-[540px] items-center justify-center">
        <div className="w-full">

          {/* Header */}
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

          {/* Card */}
          <div className="rounded-[28px] border border-white/10 bg-[#0c1428] px-6 py-7">

            {/* Tabs */}
            <div className="mb-6 flex justify-center gap-3 border-b border-white/10 pb-4">

              <button
                onClick={() => setMode("signup")}
                className={`px-4 py-2 rounded-full transition ${
                  mode === "signup"
                    ? "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Sign up
              </button>

              <button
                onClick={() => setMode("login")}
                className={`px-4 py-2 rounded-full transition ${
                  mode === "login"
                    ? "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Log in
              </button>

            </div>

            {/* Form */}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#243148] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-fuchsia-500"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#243148] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-fuchsia-500"
              />

              {message && (
                <div className="text-sm text-fuchsia-300">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 py-3 font-semibold text-white transition hover:scale-[1.02]"
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