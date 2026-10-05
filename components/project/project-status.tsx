import type { ProjectStatus } from "@/lib/api/projects";
import { formatEnumLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "PLANNING",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
];

export function formatStatus(status: ProjectStatus): string {
  return formatEnumLabel(status);
}

/** Background class for each status, for bars and legends. */
export const PROJECT_STATUS_FILL: Record<ProjectStatus, string> = {
  PLANNING: "bg-warning",
  ACTIVE: "bg-brand",
  COMPLETED: "bg-foreground/55",
  ARCHIVED: "bg-foreground/15",
};

/**
 * Status glyph. Each status differs by shape as well as color, so it still
 * reads without color: dashed ring, ring with a core, filled check, struck
 * ring.
 */
export function ProjectStatusIcon({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={cn("size-3.5 shrink-0", className)}
    >
      {status === "PLANNING" && (
        <circle
          cx="7"
          cy="7"
          r="5.25"
          strokeWidth="1.5"
          strokeDasharray="2.2 2.2"
          className="stroke-warning"
        />
      )}
      {status === "ACTIVE" && (
        <>
          <circle
            cx="7"
            cy="7"
            r="5.25"
            strokeWidth="1.5"
            className="stroke-brand"
          />
          <circle cx="7" cy="7" r="2.5" className="fill-brand" />
        </>
      )}
      {status === "COMPLETED" && (
        <>
          <circle cx="7" cy="7" r="6" className="fill-foreground/55" />
          <path
            d="M4.4 7.2 6.2 9l3.4-3.8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-card"
          />
        </>
      )}
      {status === "ARCHIVED" && (
        <>
          <circle
            cx="7"
            cy="7"
            r="5.25"
            strokeWidth="1.5"
            className="stroke-muted-foreground/50"
          />
          <path
            d="M4.6 7h4.8"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="stroke-muted-foreground/50"
          />
        </>
      )}
    </svg>
  );
}

export function ProjectStatusLabel({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px] text-foreground",
        className
      )}
    >
      <ProjectStatusIcon status={status} />
      {formatStatus(status)}
    </span>
  );
}
