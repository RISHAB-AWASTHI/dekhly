export default function Logo({
  className = "",
  mark = true,
}: {
  className?: string;
  mark?: boolean;
}) {
  return (
    <span className={`inline-flex select-none items-center gap-2.5 ${className}`}>
      {mark && (
        <span className="relative flex h-[1.25em] w-[1.25em] shrink-0 items-center justify-center rounded-[0.4em] bg-gradient-to-br from-[#6b4cff] via-[#8b6dff] to-[#ff5e9a] shadow-[0_8px_24px_-6px_rgba(124,92,255,0.6)] overflow-hidden transition-transform duration-300 hover:scale-105">
          {/* Subtle inner glow and lighting */}
          <span className="absolute inset-0 bg-white/10 mix-blend-overlay"></span>
          <span className="absolute -inset-1 bg-gradient-to-tr from-white/20 to-transparent blur-[3px] rounded-full"></span>
          {/* Play Icon */}
          <svg viewBox="0 0 24 24" className="relative z-10 h-[0.65em] w-[0.65em] translate-x-[2px]" fill="none">
            <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" fill="white" />
          </svg>
        </span>
      )}
      <span className="font-display text-[1.1em] tracking-tight">
        <span className="font-black text-white">dekh</span>
        <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-br from-[#8b6dff] to-[#ff5e9a]">ly</span>
        <span className="font-black text-[#ff5e9a]">.</span>
      </span>
    </span>
  );
}
