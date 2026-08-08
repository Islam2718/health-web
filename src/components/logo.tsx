import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { box: 28, text: "text-lg" },
  md: { box: 36, text: "text-xl" },
  lg: { box: 48, text: "text-3xl" },
};

export function Logo({ className, iconOnly = false, size = "md" }: LogoProps) {
  const { box, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={box}
        height={box}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ibnocare-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4fbaad" />
            <stop offset="100%" stopColor="#176e76" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="12" fill="url(#ibnocare-grad)" />

        {/* IBC monogram */}
        <text
          x="20"
          y="18.5"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
          fontWeight="800"
          fontSize="13.5"
          letterSpacing="0.3"
        >
          IBC
        </text>

        {/* Pulse / heartbeat accent */}
        <path
          d="M7 29h5l1.8-4 2.6 8 2.3-9.5 2.2 5.5h11.1"
          stroke="white"
          strokeOpacity="0.75"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {!iconOnly && (
        <span className={cn("font-semibold tracking-tight", text)}>
          <span className="text-foreground">Ibno</span>
          <span className="text-primary">care</span>
        </span>
      )}
    </div>
  );
}
