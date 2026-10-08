import Link from "next/link";

import {
  TASK_STATUSES,
  TASK_STATUS_LABEL,
  TaskAssignee,
  TaskPriorityBadge,
  TaskStatusMarker,
  formatDueDate,
} from "@/components/project/task-meta";
import { Skeleton } from "@/components/ui/skeleton";
import type { GlobalTask } from "@/lib/api/tasks";

// Horizontal scroll rather than squeezing five columns on small screens.
const BOARD_CLASSES =
  "-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0";
const COLUMNS_CLASSES = "grid min-w-[62rem] grid-cols-5 gap-3";

function TaskCard({ task }: { task: GlobalTask }) {
  return (
    <li className="glass-interactive flex flex-col gap-2.5 rounded-lg border p-3">
      <div className="min-w-0">
        <Link
          href={`/projects/${task.projectId}/tasks/${task.id}`}
          className="line-clamp-2 rounded-sm text-sm leading-5 font-medium break-words text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {task.title}
        </Link>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {task.project.name}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <TaskPriorityBadge priority={task.priority} />
        {task.dueDate && (
          <time
            dateTime={task.dueDate}
            className="text-xs text-muted-foreground"
          >
            {formatDueDate(task.dueDate)}
          </time>
        )}
      </div>

      <TaskAssignee assignee={task.assignee} />
    </li>
  );
}

export function TaskBoard({ tasks }: { tasks: GlobalTask[] }) {
  return (
    <div className={BOARD_CLASSES}>
      <ol className={COLUMNS_CLASSES} aria-label="Tasks by status">
        {TASK_STATUSES.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status);

          return (
            <li key={status} className="flex min-w-0 flex-col gap-2">
              <div className="flex h-7 items-center gap-2 px-1">
                <TaskStatusMarker status={status} />
                <h2 className="eyebrow">{TASK_STATUS_LABEL[status]}</h2>
                <span className="font-mono text-[11px] text-muted-foreground/70 tabular-nums">
                  {columnTasks.length}
                </span>
              </div>
              <div className="min-h-28 rounded-xl border border-border bg-accent/30 p-2">
                {columnTasks.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-muted-foreground/70">
                    No tasks
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function TaskBoardSkeleton() {
  return (
    <div className={BOARD_CLASSES} role="status" aria-label="Loading tasks">
      <div className={COLUMNS_CLASSES}>
        {TASK_STATUSES.map((status, column) => (
          <div key={status} className="flex flex-col gap-2">
            <div className="flex h-7 items-center gap-2 px-1">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex min-h-28 flex-col gap-2 rounded-xl border border-border bg-accent/30 p-2">
              {Array.from({ length: column % 2 === 0 ? 2 : 1 }).map(
                (_, index) => (
                  <Skeleton key={index} className="h-24 rounded-lg" />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
