"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/components/Logo";
import { picsumBackdrop } from "@/lib/data";
import { getStoredUser, signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Already signed in? Skip straight to profiles.
  useEffect(() => {
    if (getStoredUser()) router.replace("/");
  }, [router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter a valid email or phone number.");
      return;
    }
    signIn(email.trim());
    router.replace("/");
  };

  return (
    <main className="relative min-h-screen bg-ink">
      {/* Backdrop */}
      <div className="absolute inset-0">
        <Image
          src={picsumBackdrop("dekhly-login-hero")}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
      </div>

      <header className="relative z-10 px-4 py-5 md:px-12">
        <Logo className="text-2xl md:text-3xl" />
      </header>

      <div className="relative z-10 flex justify-center px-4 pb-20 pt-6">
        <div className="glass w-full max-w-md rounded-3xl px-6 py-10 sm:px-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Welcome to dekhly
          </p>
          <h1 className="font-display mb-7 text-3xl font-extrabold tracking-tight">
            Sign In
          </h1>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Email or phone number"
                className="w-full rounded-xl bg-white/5 px-4 py-3.5 text-sm outline-none ring-1 ring-white/10 transition focus:ring-brand"
              />
              {error && (
                <p className="mt-1.5 text-xs text-amber-500">{error}</p>
              )}
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl bg-white/5 px-4 py-3.5 text-sm outline-none ring-1 ring-white/10 transition focus:ring-brand"
            />

            <button
              type="submit"
              className="bg-brand-gradient mt-2 w-full rounded-xl py-3 font-bold text-white transition hover:scale-[1.02] glow-brand"
            >
              Sign In
            </button>

            <div className="flex items-center justify-between text-sm text-neutral-400">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-neutral-500"
                />
                Remember me
              </label>
              <a href="#" className="hover:underline">
                Need help?
              </a>
            </div>
          </form>

          <p className="mt-10 text-sm text-neutral-400">
            New to dekhly?{" "}
            <button
              onClick={() => {
                signIn(email.trim() || "guest@dekhly.app");
                router.replace("/");
              }}
              className="font-medium text-white hover:underline"
            >
              Sign up now
            </button>
            .
          </p>
          <p className="mt-3 text-xs text-neutral-500">
            Demo only — no real account is created. Any details sign you in
            locally.
          </p>
        </div>
      </div>
    </main>
  );
}
