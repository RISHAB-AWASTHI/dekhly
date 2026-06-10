"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import Logo from "@/components/Logo";
import AuthGuard from "@/components/AuthGuard";
import { profiles } from "@/lib/data";
import { signOut } from "@/lib/auth";

export default function ProfileGate() {
  return (
    <AuthGuard>
      <main className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 py-5 md:px-12">
          <Logo className="text-2xl md:text-3xl" />
          <button
            onClick={signOut}
            className="glass rounded-full px-4 py-2 text-sm text-neutral-300 transition hover:text-white"
          >
            Sign out
          </button>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-24">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-brand">
            dekhly profiles
          </p>
          <h1 className="font-display mb-12 text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
            Who&apos;s watching?
          </h1>

          <ul className="flex flex-wrap items-start justify-center gap-6 sm:gap-10">
            {profiles.map((p) => (
              <li key={p.id}>
                <Link
                  href="/browse"
                  className="group flex w-[110px] flex-col items-center gap-4"
                >
                  <div className="relative">
                    <div
                      className="grid aspect-square w-[110px] place-items-center rounded-full text-4xl font-black text-white transition duration-300 group-hover:scale-105 sm:w-[130px] sm:text-5xl"
                      style={{
                        background: `linear-gradient(135deg, ${p.color}, #7c5cff)`,
                      }}
                    >
                      {p.name[0]}
                    </div>
                    <div className="absolute inset-0 rounded-full ring-2 ring-white/0 transition group-hover:ring-white/70" />
                  </div>
                  <span className="text-neutral-400 transition group-hover:text-white">
                    {p.name}
                  </span>
                </Link>
              </li>
            ))}

            <li>
              <button className="group flex w-[110px] flex-col items-center gap-4">
                <div className="glass grid aspect-square w-[110px] place-items-center rounded-full text-neutral-400 transition group-hover:text-white sm:w-[130px]">
                  <span className="text-5xl font-light">+</span>
                </div>
                <span className="text-neutral-400">Add Profile</span>
              </button>
            </li>
          </ul>

          <Link
            href="/browse"
            className="glass mt-14 flex items-center gap-2 rounded-full px-6 py-2.5 text-sm tracking-widest text-neutral-300 transition hover:text-white"
          >
            <Pencil size={15} />
            MANAGE PROFILES
          </Link>
        </div>
      </main>
    </AuthGuard>
  );
}
