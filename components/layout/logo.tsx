import { cn } from "@/lib/utils";

/** Three stepped lanes: an "F" that also reads as work flowing through stages. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-5 shrink-0 text-brand", className)}
    >
      <rect x="3" y="3.3" width="14" height="3.4" rx="1.7" />
      <rect x="3" y="8.3" width="9.5" height="3.4" rx="1.7" opacity="0.7" />
      <rect x="3" y="13.3" width="5" height="3.4" rx="1.7" opacity="0.4" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground",
        className
      )}
    >
      <LogoMark />
      FlowForge
    </span>
  );
}
