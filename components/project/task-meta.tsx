import { Badge } from "@/components/ui/badge";
import type { TaskPriority, TaskStatus } from "@/lib/api/tasks";
import { cn } from "@/lib/utils";

/** Workflow order, from not started to finished. */
export const TASK_STATUSES: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const TASK_STATUS_MARKER: Record<TaskStatus, string> = {
  BACKLOG: "border border-dashed border-muted-foreground/60",
  TODO: "border border-muted-foreground/60",
  IN_PROGRESS: "bg-warning",
  IN_REVIEW: "bg-brand",
  DONE: "bg-foreground/55",
};

export const TASK_PRIORITIES: TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const TASK_PRIORITY_BADGE: Record<
  TaskPriority,
  "outline" | "secondary" | "destructive"
> = {
  LOW: "outline",
  MEDIUM: "outline",
  HIGH: "secondary",
  URGENT: "destructive",
};

export function TaskStatusMarker({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-2 shrink-0 rounded-full",
        TASK_STATUS_MARKER[status],
        className
      )}
    />
  );
}

export function TaskStatusLabel({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[13px] whitespace-nowrap text-foreground",
        className
      )}
    >
      <TaskStatusMarker status={status} />
      {TASK_STATUS_LABEL[status]}
    </span>
  );
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge
      variant={TASK_PRIORITY_BADGE[priority]}
      className={cn(priority === "LOW" && "text-muted-foreground/70")}
    >
      {TASK_PRIORITY_LABEL[priority]}
    </Badge>
  );
}

/**
 * Due dates are calendar days stored as midnight UTC, so they're formatted in
 * UTC. Formatting in local time would show the previous day west of UTC.
 */
export function formatDueDate(dueDate: string): string {
  return new Date(dueDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
