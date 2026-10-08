"use client";

import { useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { CircleAlert, ListChecks, Lock, Plus } from "lucide-react";

import { Panel, SectionHeader } from "@/components/layout/page-header";
import { CreateTaskDialog } from "@/components/project/create-task-dialog";
import { TaskActions } from "@/components/project/task-actions";
import {
  TaskPriorityBadge,
  TaskStatusLabel,
  TASK_PRIORITY_LABEL,
  formatDueDate,
} from "@/components/project/task-meta";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { canManageOrganization } from "@/lib/api/organizations";
import type { ProjectDetails, ProjectMemberSummary } from "@/lib/api/projects";
import type { Task } from "@/lib/api/tasks";
import { getInitials } from "@/lib/format";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProjectTasks } from "@/lib/hooks/use-tasks";
import { cn } from "@/lib/utils";

// Shared by the header, rows and skeleton so the columns always line up.
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto_1.75rem] items-center gap-x-4 px-4 md:grid-cols-[minmax(0,1fr)_7.5rem_4.5rem_9rem_6.5rem_1.75rem]";

function TasksHeader() {
  return (
    <div
      aria-hidden="true"
      className={cn(ROW_GRID, "hidden h-9 border-b border-border md:grid")}
    >
      <span className="eyebrow">Task</span>
      <span className="eyebrow">Status</span>
      <span className="eyebrow">Priority</span>
      <span className="eyebrow">Assignee</span>
      <span className="eyebrow">Due</span>
      <span />
    </div>
  );
}

function TasksSkeleton() {
  return (
    <div role="status" aria-label="Loading tasks">
      <TasksHeader />
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={cn(ROW_GRID, "h-[52px] border-b border-border last:border-0")}
        >
          <Skeleton className="h-3.5 w-48 max-w-full" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="hidden h-4 w-12 md:block" />
          <Skeleton className="hidden h-3.5 w-24 md:block" />
          <Skeleton className="hidden h-3 w-16 md:block" />
          <span />
        </div>
      ))}
    </div>
  );
}

function TaskRow({
  task,
  members,
  canDelete,
}: {
  task: Task;
  members: ProjectMemberSummary[];
  canDelete: boolean;
}) {
  const dueLabel = task.dueDate ? formatDueDate(task.dueDate) : "No due date";

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
        {/* On narrow screens the secondary columns collapse into one line. */}
        <p className="mt-0.5 truncate text-xs text-muted-foreground md:hidden">
          {TASK_PRIORITY_LABEL[task.priority]} priority ·{" "}
          {task.assignee?.name ?? "Unassigned"} · {dueLabel}
        </p>
      </div>

      <TaskStatusLabel status={task.status} />

      <div className="hidden md:block">
        <TaskPriorityBadge priority={task.priority} />
      </div>

      <div className="hidden min-w-0 items-center gap-2 md:flex">
        {task.assignee ? (
          <>
            <Avatar size="sm">
              {task.assignee.avatarUrl && (
                <AvatarImage src={task.assignee.avatarUrl} alt="" />
              )}
              <AvatarFallback>{getInitials(task.assignee.name)}</AvatarFallback>
            </Avatar>
            <span className="truncate text-[13px] text-foreground">
              {task.assignee.name}
            </span>
          </>
        ) : (
          <span className="text-[13px] text-muted-foreground">Unassigned</span>
        )}
      </div>

      {task.dueDate ? (
        <time
          dateTime={task.dueDate}
          className="hidden truncate text-[13px] text-foreground md:block"
        >
          {dueLabel}
        </time>
      ) : (
        <span className="hidden truncate text-[13px] text-muted-foreground md:block">
          {dueLabel}
        </span>
      )}

      <TaskActions task={task} members={members} canDelete={canDelete} />
    </li>
  );
}

export function ProjectTasks({ project }: { project: ProjectDetails }) {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Mirrors the backend rule: owners and admins always have task access;
  // a member needs to be on the project. The backend still has the final say.
  const canManage = canManageOrganization(project.requesterRole);
  const hasTaskAccess =
    canManage ||
    project.members.some((member) => member.userId === user?.id);

  const { tasks, isLoading, error, refetch } = useProjectTasks(
    hasTaskAccess ? project.id : undefined
  );

  const isForbidden =
    !hasTaskAccess ||
    (isAxiosError(error) && error.response?.status === 403);
  const isLoaded = hasTaskAccess && !isLoading && !error;

  const openCreateDialog = () => setCreateDialogOpen(true);

  return (
    <section aria-labelledby="project-tasks-heading">
      <SectionHeader
        title={<span id="project-tasks-heading">Tasks</span>}
        meta={isLoaded ? tasks.length : undefined}
        action={
          !isForbidden && (
            <Button variant="ghost" size="sm" onClick={openCreateDialog}>
              <Plus />
              Add task
            </Button>
          )
        }
        className="mb-2"
      />
      <Panel>
        {isForbidden ? (
          <EmptyState
            icon={Lock}
            title="Tasks are limited to project members"
            description="Ask an owner or admin to add you to this project to see and create its tasks."
          />
        ) : isLoading ? (
          <TasksSkeleton />
        ) : error ? (
          <EmptyState
            icon={CircleAlert}
            title="Couldn't load tasks"
            description="Something went wrong while fetching this project's tasks."
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No tasks yet"
            description="Create the first task for this project to start tracking work."
            action={
              <Button size="sm" onClick={openCreateDialog}>
                <Plus />
                Add task
              </Button>
            }
          />
        ) : (
          <div>
            <TasksHeader />
            <ul>
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  members={project.members}
                  canDelete={canManage}
                />
              ))}
            </ul>
          </div>
        )}
      </Panel>

      {!isForbidden && (
        <CreateTaskDialog
          project={project}
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      )}
    </section>
  );
}
