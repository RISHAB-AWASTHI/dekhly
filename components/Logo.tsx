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
        <span className="bg-brand-gradient grid h-[1.05em] w-[1.05em] place-items-center rounded-[0.32em] shadow-[0_4px_14px_-2px_rgba(124,92,255,0.6)]">
          <svg viewBox="0 0 24 24" className="h-[0.58em] w-[0.58em]" fill="white">
            <path d="M8 5v14l11-7z" />
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
