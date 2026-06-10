export default function Logo({
  className = "",
  mark = true,
}: {
  className?: string;
  mark?: boolean;
}) {
  return (
    <span className={`inline-flex select-none items-center gap-2 ${className}`}>
      {mark && (
        <span className="bg-brand-gradient relative grid h-[1.15em] w-[1.15em] place-items-center rounded-[0.35em] shadow-[0_4px_16px_-2px_rgba(124,92,255,0.7)] overflow-hidden">
          <span className="absolute -inset-1 bg-gradient-to-tr from-white/20 to-transparent blur-[2px] rounded-full"></span>
          <svg viewBox="0 0 24 24" className="h-[0.65em] w-[0.65em] relative z-10 translate-x-[1px]" fill="none">
            <path d="M6 4v16l13-8L6 4Z" fill="white" fillOpacity="0.85" />
            <path d="M6 12v8l13-8-6.5-4-6.5 4Z" fill="white" />
          </svg>
        </span>
      )}
      <span className="font-display font-extrabold tracking-tight">
        <span className="text-white">dekh</span>
        <span className="text-gradient">ly</span>
      </span>
    </span>
  );
}
