"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { name: "Home", href: "/" },
  { name: "Discover", href: "/discover" },
  { name: "Watch Later", href: "/watch-later" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.06] bg-ink/85 backdrop-blur-xl"
          : "bg-gradient-to-b from-black/70 to-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[68px] max-w-[1700px] items-center gap-8 px-5 md:px-14">
        <Link href="/" className="shrink-0">
          <Logo className="text-[26px]" />
        </Link>

        <ul className="hidden items-center gap-7 text-[15px] lg:flex">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
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
        </div>
      </nav>
    </header>
  );
}
