"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, ChevronDown, Pencil, User, HelpCircle, LogOut } from "lucide-react";
import Logo from "./Logo";
import { profiles } from "@/lib/data";
import { signOut, useAuth } from "@/lib/auth";

const LINKS = [
  { name: "Home", href: "/browse" },
  { name: "Movies", href: "/browse" },
  { name: "Series", href: "/browse" },
  { name: "Watch Later", href: "/watch-later" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSignOut = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.06] bg-ink/85 backdrop-blur-xl"
          : "bg-gradient-to-b from-black/70 to-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[68px] max-w-[1700px] items-center gap-8 px-5 md:px-14">
        <Link href="/browse" className="shrink-0">
          <Logo className="text-[26px]" />
        </Link>

        <ul className="hidden items-center gap-7 text-[15px] lg:flex">
          {LINKS.map((link) => {
            const isActive = pathname === link.href && link.name !== "Movies" && link.name !== "Series";
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`relative transition hover:text-white ${
                    isActive ? "font-semibold text-white" : "text-neutral-400"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="bg-brand absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-3 text-neutral-200">
          <Link
            href="/search"
            className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-neutral-400 transition hover:border-white/20 hover:text-white"
          >
            <Search size={16} />
            <span className="hidden md:inline">Search</span>
          </Link>

          <button className="relative grid h-9 w-9 place-items-center rounded-full text-neutral-300 transition hover:text-white" aria-label="Notifications">
            <Bell size={19} />
            <span className="bg-brand absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-ink" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full p-0.5 transition hover:bg-white/5"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="bg-brand-gradient grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white">
                {user?.initial ?? "G"}
              </span>
              <ChevronDown
                size={15}
                className={`text-neutral-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen && (
              <div className="glass absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl py-2 text-sm shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                  <span className="bg-brand-gradient grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white">
                    {user?.initial ?? "G"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{user?.name ?? "Guest"}</p>
                    <p className="truncate text-xs text-neutral-500">{user?.email ?? "guest@dekhly.app"}</p>
                  </div>
                </div>
                <div className="border-b border-white/[0.06] py-1">
                  {profiles.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-300 transition hover:bg-white/5"
                    >
                      <span className="grid h-6 w-6 place-items-center rounded-full text-xs font-bold" style={{ backgroundColor: p.color }}>
                        {p.name[0]}
                      </span>
                      {p.name}
                    </Link>
                  ))}
                </div>
                <div className="border-b border-white/[0.06] py-1 text-neutral-300">
                  <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 transition hover:bg-white/5">
                    <Pencil size={16} /> Manage Profiles
                  </Link>
                  <button className="flex w-full items-center gap-3 px-4 py-2 transition hover:bg-white/5">
                    <User size={16} /> Account
                  </button>
                  <button className="flex w-full items-center gap-3 px-4 py-2 transition hover:bg-white/5">
                    <HelpCircle size={16} /> Help Centre
                  </button>
                </div>
                <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-4 py-2.5 text-neutral-300 transition hover:bg-white/5">
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
