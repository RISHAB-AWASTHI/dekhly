export default function Logo({
  className = "",
  mark = true,
}: {
  className?: string;
  mark?: boolean;
}) {
  return (
    <span className={`inline-flex select-none items-center gap-[0.4em] ${className}`}>
      {mark && (
        <svg
          viewBox="0 0 32 32"
          className="h-[1.1em] w-[1.1em]"
          role="img"
          aria-label="dekhly"
        >
          <defs>
            <linearGradient id="dk-mark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8f72ff" />
              <stop offset="1" stopColor="#6d4df0" />
            </linearGradient>
          </defs>
          {/* Rounded square, single restrained color */}
          <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#dk-mark)" />
          {/* Optically centered play, rounded corners for a premium feel */}
          <path
            d="M13.4 11.3c0-1 1.1-1.6 1.9-1.1l6.8 4.1c.9.5.9 1.7 0 2.2l-6.8 4.1c-.8.5-1.9-.1-1.9-1.1v-8.3Z"
            fill="white"
          />
        </svg>
      )}
      <span className="font-display font-extrabold tracking-[-0.04em] text-white">
        dekhly
      </span>
    </span>
  );
}
