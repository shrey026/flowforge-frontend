import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-6 gap-y-4",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-2xl leading-8 font-semibold tracking-tight text-balance text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export function SectionHeader({
  title,
  meta,
  action,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex h-7 items-center justify-between gap-4", className)}
    >
      <div className="flex min-w-0 items-baseline gap-2">
        <h2 className="eyebrow">{title}</h2>
        {meta !== undefined && (
          <span className="font-mono text-[11px] text-muted-foreground/70 tabular-nums">
            {meta}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

/** Bordered surface that groups a list or a block of related content. */
export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "glass-surface overflow-hidden rounded-xl border",
        className
      )}
    >
      {children}
    </div>
  );
}
