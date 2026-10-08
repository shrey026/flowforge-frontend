"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { ArrowLeft, CircleAlert, FileQuestion } from "lucide-react";

import {
  PageHeader,
  Panel,
  Property,
  SectionHeader,
} from "@/components/layout/page-header";
import { TaskActions } from "@/components/project/task-actions";
import {
  TaskPriorityBadge,
  TaskStatusLabel,
  formatDueDate,
} from "@/components/project/task-meta";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { canManageOrganization } from "@/lib/api/organizations";
import type { TaskUserSummary } from "@/lib/api/tasks";
import { formatDate, formatRelativeTime, getInitials } from "@/lib/format";
import { useProject } from "@/lib/hooks/use-projects";
import { useTask } from "@/lib/hooks/use-tasks";

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-sm text-[13px] text-muted-foreground transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <ArrowLeft className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function Person({ person }: { person: TaskUserSummary }) {
  return (
    <span className="inline-flex min-w-0 items-center justify-end gap-2">
      <Avatar size="sm">
        {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt="" />}
        <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
      </Avatar>
      <span className="truncate">{person.name}</span>
    </span>
  );
}

function TaskDetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading task">
      <Skeleton className="h-7 w-80 max-w-full" />
      <div className="mt-3 flex gap-4">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function TaskDetailsPage() {
  const router = useRouter();
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();
  const { task, isLoading, error, refetch } = useTask(taskId);

  // The task response has no requester role or member list, so both come from
  // the project details query. It is usually already cached from the project
  // page. Members are the only valid assignees, and the role gates deletion.
  const { project, isLoading: isProjectLoading } = useProject(
    task?.project.id
  );

  const errorStatus = isAxiosError(error) ? error.response?.status : undefined;

  // Checked before `task` on purpose: a cached copy can outlive a task that
  // has since been deleted or become inaccessible.
  if (error) {
    const isMissing = errorStatus === 404 || errorStatus === 403;

    return (
      <div className="flex flex-col gap-6">
        <BackLink href={`/projects/${projectId}`} label="Back to project" />
        <Panel>
          {isMissing ? (
            <EmptyState
              icon={FileQuestion}
              title="Task not found"
              description="It may have been deleted, or you might not have access to it."
              action={
                <Link
                  href={`/projects/${projectId}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Back to project
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={CircleAlert}
              title="Couldn't load this task"
              description="Something went wrong while fetching the task."
              action={
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try again
                </Button>
              }
            />
          )}
        </Panel>
      </div>
    );
  }

  if (isLoading || !task) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink href={`/projects/${projectId}`} label="Back to project" />
        <TaskDetailsSkeleton />
      </div>
    );
  }

  const projectHref = `/projects/${task.project.id}`;
  const canDelete = project
    ? canManageOrganization(project.requesterRole)
    : false;

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={projectHref} label={task.project.name} />

      <PageHeader
        title={<span className="break-words">{task.title}</span>}
        description={
          <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <TaskStatusLabel status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </span>
        }
        actions={
          project ? (
            <TaskActions
              task={task}
              members={project.members}
              canDelete={canDelete}
              onDeleted={() => router.push(projectHref)}
            />
          ) : (
            isProjectLoading && <Skeleton className="size-7" />
          )
        }
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-labelledby="task-description-heading">
          <SectionHeader
            title={<span id="task-description-heading">Description</span>}
            className="mb-2"
          />
          <Panel className="px-4 py-3.5">
            {task.description ? (
              <p className="text-sm leading-6 break-words whitespace-pre-wrap text-foreground">
                {task.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No description</p>
            )}
          </Panel>
        </section>

        <section aria-labelledby="task-details-heading">
          <SectionHeader
            title={<span id="task-details-heading">Details</span>}
            className="mb-2"
          />
          <Panel>
            <dl>
              <Property label="Status">
                <TaskStatusLabel status={task.status} />
              </Property>
              <Property label="Priority">
                <TaskPriorityBadge priority={task.priority} />
              </Property>
              <Property label="Assignee">
                {task.assignee ? (
                  <Person person={task.assignee} />
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </Property>
              <Property label="Due date">
                {task.dueDate ? (
                  <time dateTime={task.dueDate}>
                    {formatDueDate(task.dueDate)}
                  </time>
                ) : (
                  <span className="text-muted-foreground">No due date</span>
                )}
              </Property>
              <Property label="Project">
                <Link
                  href={projectHref}
                  className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  {task.project.name}
                </Link>
              </Property>
              <Property label="Created by">
                <span className="flex flex-col items-end">
                  <Person person={task.createdBy} />
                  <span className="max-w-full truncate text-xs text-muted-foreground">
                    {task.createdBy.email}
                  </span>
                </span>
              </Property>
              <Property label="Created">
                <time dateTime={task.createdAt}>
                  {formatDate(task.createdAt)}
                </time>
              </Property>
              <Property label="Updated">
                <time
                  dateTime={task.updatedAt}
                  title={formatDate(task.updatedAt)}
                >
                  {formatRelativeTime(task.updatedAt)}
                </time>
              </Property>
            </dl>
          </Panel>
        </section>
      </div>
    </div>
  );
}
