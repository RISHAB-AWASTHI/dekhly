import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Logo from "./Logo";

const COLS = [
  ["Audio Description", "Investor Relations", "Legal Notices"],
  ["Help Centre", "Jobs", "Cookie Preferences"],
  ["Gift Cards", "Terms of Use", "Corporate Information"],
  ["Media Centre", "Privacy", "Contact Us"],
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/5 px-4 py-12 text-sm text-neutral-500 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-5">
          <a href="#" aria-label="Facebook" className="transition hover:text-white">
            <Facebook size={20} />
          </a>
          <a href="#" aria-label="Instagram" className="transition hover:text-white">
            <Instagram size={20} />
          </a>
          <a href="#" aria-label="Twitter" className="transition hover:text-white">
            <Twitter size={20} />
          </a>
          <a href="#" aria-label="YouTube" className="transition hover:text-white">
            <Youtube size={20} />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COLS.map((col) => (
            <ul key={col[0]} className="space-y-3">
              {col.map((item) => (
                <li key={item}>
                  <a href="#" className="transition hover:text-neutral-300 hover:underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>

        <button className="mt-8 rounded border border-white/20 px-3 py-1.5 text-xs transition hover:text-white">
          English
        </button>

        <div className="mt-6 flex items-center gap-2">
          <Logo className="text-base" />
          <span className="text-xs text-neutral-600">· Find where to watch.</span>
        </div>
        <p className="mt-3 max-w-2xl text-xs leading-relaxed text-neutral-600">
          © {2026} dekhly. A movie &amp; series discovery service — we help you
          find where titles are legally available to stream, rent or buy.
          dekhly hosts and streams no media; every link points to an official
          platform.
        </p>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-neutral-600">
          This product uses the TMDB API but is not endorsed or certified by
          TMDB. Streaming availability data provided by JustWatch.
        </p>
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-neutral-500 transition hover:text-neutral-300"
        >
          Powered by TMDB
        </a>
      </div>
    </footer>
  );
}
