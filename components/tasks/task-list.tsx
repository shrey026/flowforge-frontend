import Link from "next/link";

import {
  TASK_PRIORITY_LABEL,
  TaskAssignee,
  TaskPriorityBadge,
  TaskStatusLabel,
  formatDueDate,
} from "@/components/project/task-meta";
import { Panel } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import type { GlobalTask } from "@/lib/api/tasks";
import { cn } from "@/lib/utils";

/*
 * Columns appear as space allows, so nothing is squeezed:
 *   small:  task | status             (project, priority, assignee, due under the title)
 *   md:     task | project | status | priority   (assignee, due under the title)
 *   xl:     task | project | status | priority | assignee | due
 * Shared by the header, rows and skeleton so the columns always line up.
 */
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-4 md:grid-cols-[minmax(0,1fr)_9rem_7.5rem_4.5rem] xl:grid-cols-[minmax(0,1fr)_9rem_7.5rem_4.5rem_9rem_6.5rem]";

function TaskListHeader() {
  return (
    <div
      aria-hidden="true"
      className={cn(ROW_GRID, "hidden h-9 border-b border-border md:grid")}
    >
      <span className="eyebrow">Task</span>
      <span className="eyebrow">Project</span>
      <span className="eyebrow">Status</span>
      <span className="eyebrow">Priority</span>
      <span className="eyebrow hidden xl:block">Assignee</span>
      <span className="eyebrow hidden xl:block">Due</span>
    </div>
  );
}

function TaskListRow({ task }: { task: GlobalTask }) {
  const dueLabel = task.dueDate ? formatDueDate(task.dueDate) : "No due date";
  const assigneeLabel = task.assignee?.name ?? "Unassigned";

  return (
    <li
      className={cn(
        ROW_GRID,
        "min-h-[52px] border-b border-border py-2.5 transition-colors duration-150 ease-out last:border-0 hover:bg-accent/50"
      )}
    >
      <div className="min-w-0">
        <Link
          href={`/projects/${task.projectId}/tasks/${task.id}`}
          className="block truncate rounded-sm text-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {task.title}
        </Link>
        <p className="mt-0.5 truncate text-xs text-muted-foreground md:hidden">
          {task.project.name} · {TASK_PRIORITY_LABEL[task.priority]} ·{" "}
          {assigneeLabel} · {dueLabel}
        </p>
        <p className="mt-0.5 hidden truncate text-xs text-muted-foreground md:block xl:hidden">
          {assigneeLabel} · {dueLabel}
        </p>
      </div>

      <span className="hidden truncate text-[13px] text-muted-foreground md:block">
        {task.project.name}
      </span>

      <TaskStatusLabel status={task.status} />

      <div className="hidden md:block">
        <TaskPriorityBadge priority={task.priority} />
      </div>

      <TaskAssignee
        assignee={task.assignee}
        className="hidden xl:flex"
      />

      {task.dueDate ? (
        <time
          dateTime={task.dueDate}
          className="hidden truncate text-[13px] text-foreground xl:block"
        >
          {dueLabel}
        </time>
      ) : (
        <span className="hidden truncate text-[13px] text-muted-foreground xl:block">
          {dueLabel}
        </span>
      )}
    </li>
  );
}

export function TaskList({ tasks }: { tasks: GlobalTask[] }) {
  return (
    <Panel>
      <TaskListHeader />
      <ul>
        {tasks.map((task) => (
          <TaskListRow key={task.id} task={task} />
        ))}
      </ul>
    </Panel>
  );
}

export function TaskListSkeleton() {
  return (
    <Panel>
      <div role="status" aria-label="Loading tasks">
        <TaskListHeader />
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              ROW_GRID,
              "h-[52px] border-b border-border last:border-0"
            )}
          >
            <Skeleton className="h-3.5 w-48 max-w-full" />
            <Skeleton className="hidden h-3 w-20 md:block" />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="hidden h-4 w-12 md:block" />
            <Skeleton className="hidden h-3.5 w-24 xl:block" />
            <Skeleton className="hidden h-3 w-16 xl:block" />
          </div>
        ))}
      </div>
    </Panel>
  );
}
