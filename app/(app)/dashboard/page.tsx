"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Building2, CircleAlert, FolderKanban, Plus } from "lucide-react";

import { PageHeader, Panel, SectionHeader } from "@/components/layout/page-header";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_FILL,
  ProjectStatusIcon,
  formatStatus,
} from "@/components/project/project-status";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import { useWorkspaceActions } from "@/components/providers/workspace-actions-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrganizationMember } from "@/lib/api/members";
import type { Project } from "@/lib/api/projects";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { useAuth } from "@/lib/hooks/use-auth";
import { useOrganizationMembers } from "@/lib/hooks/use-organization-members";
import { useProjects } from "@/lib/hooks/use-projects";
import { cn } from "@/lib/utils";

const RECENT_PROJECT_COUNT = 5;
const ACTIVITY_COUNT = 8;

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function countCreatedThisMonth(projects: Project[]): number {
  const now = new Date();

  return projects.filter((project) => {
    const created = new Date(project.createdAt);
    return (
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth()
    );
  }).length;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

interface ActivityEvent {
  id: string;
  title: string;
  subject: string;
  at: string;
  href?: string;
}

/**
 * There is no activity endpoint, so the feed is assembled from timestamps the
 * API already returns: when projects were created or last changed, and when
 * members joined. Nothing here is invented.
 */
function buildActivity(
  projects: Project[],
  members: OrganizationMember[]
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const project of projects) {
    const href = `/projects/${project.id}`;

    events.push({
      id: `project-created-${project.id}`,
      title: "Project created",
      subject: project.name,
      at: project.createdAt,
      href,
    });

    const changedLater =
      new Date(project.updatedAt).getTime() -
        new Date(project.createdAt).getTime() >
      60 * 1000;

    if (changedLater) {
      events.push({
        id: `project-updated-${project.id}`,
        title: "Project updated",
        subject: project.name,
        at: project.updatedAt,
        href,
      });
    }
  }

  for (const member of members) {
    events.push({
      id: `member-joined-${member.membershipId}`,
      title: "Joined the workspace",
      subject: member.name,
      at: member.joinedAt,
    });
  }

  return events
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, ACTIVITY_COUNT);
}

function Stat({
  label,
  value,
  detail,
  isLoading,
  hasError,
}: {
  label: string;
  value: number;
  detail: ReactNode;
  isLoading: boolean;
  hasError: boolean;
}) {
  return (
    <div className="px-5 py-4">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-12" />
            <Skeleton className="mt-2.5 h-3 w-28" />
          </>
        ) : (
          <>
            <span className="block text-[2rem] leading-9 font-semibold tracking-tight text-foreground tabular-nums">
              {hasError ? "—" : value}
            </span>
            <span className="mt-1 block text-[13px] text-muted-foreground">
              {hasError ? "Couldn't load" : detail}
            </span>
          </>
        )}
      </dd>
    </div>
  );
}

function StatusBreakdown({ projects }: { projects: Project[] }) {
  const counts = PROJECT_STATUSES.map((status) => ({
    status,
    count: projects.filter((project) => project.status === status).length,
  }));
  const summary = counts
    .filter(({ count }) => count > 0)
    .map(({ status, count }) => `${count} ${formatStatus(status).toLowerCase()}`)
    .join(", ");

  return (
    <div className="border-b border-border px-4 py-3.5">
      <div
        role="img"
        aria-label={`Projects by status: ${summary}`}
        className="flex h-1.5 gap-0.5 overflow-hidden rounded-full"
      >
        {counts
          .filter(({ count }) => count > 0)
          .map(({ status, count }) => (
            <span
              key={status}
              className={cn("h-full rounded-full", PROJECT_STATUS_FILL[status])}
              style={{ flexGrow: count, flexBasis: 0 }}
            />
          ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
        {counts.map(({ status, count }) => (
          <li
            key={status}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", PROJECT_STATUS_FILL[status])}
            />
            {formatStatus(status)}
            <span className="font-mono text-xs text-foreground tabular-nums">
              {count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex h-[52px] items-center gap-3 border-b border-border px-4 last:border-0"
        >
          <Skeleton className="size-3.5 rounded-full" />
          <Skeleton className="h-3.5 w-40 max-w-[50%]" />
          <Skeleton className="ml-auto h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeOrganization, isLoading: isOrganizationLoading } =
    useOrganizationContext();
  const {
    projects,
    isLoading: isProjectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects(activeOrganization?.id);
  const {
    members,
    isLoading: isMembersLoading,
    error: membersError,
  } = useOrganizationMembers(activeOrganization?.id);
  const { openCreateProject, canCreateProject } = useWorkspaceActions();

  const firstName = user?.name.trim().split(/\s+/)[0];

  const header = (
    <PageHeader
      eyebrow={getTodayLabel()}
      title={`${getGreeting()}${firstName ? `, ${firstName}` : ""}`}
      description={
        activeOrganization
          ? `Here's what's happening across ${activeOrganization.name}.`
          : "Here's what's happening across your workspace."
      }
      actions={
        canCreateProject && (
          <Button onClick={openCreateProject}>
            <Plus />
            New project
          </Button>
        )
      }
    />
  );

  if (!activeOrganization && !isOrganizationLoading) {
    return (
      <div className="flex flex-col gap-8">
        {header}
        <Panel>
          <EmptyState
            icon={Building2}
            title="No organization selected"
            description="Once you belong to an organization, its projects and activity will appear here."
          />
        </Panel>
      </div>
    );
  }

  const projectsPending = isOrganizationLoading || isProjectsLoading;
  const membersPending = isOrganizationLoading || isMembersLoading;

  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;
  const planningCount = projects.filter((p) => p.status === "PLANNING").length;
  const completedCount = projects.filter((p) => p.status === "COMPLETED").length;
  const createdThisMonth = countCreatedThisMonth(projects);
  const managerCount = members.filter((m) => m.role !== "MEMBER").length;

  const recentProjects = [...projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, RECENT_PROJECT_COUNT);
  const activity = buildActivity(projects, members);

  return (
    <div className="flex flex-col gap-8">
      {header}

      <dl className="grid grid-cols-1 glass-surface glass-tint divide-y divide-(color:--border-glass) overflow-hidden rounded-xl border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Stat
          label="Projects"
          value={projects.length}
          detail={
            createdThisMonth > 0
              ? `${createdThisMonth} created this month`
              : "None created this month"
          }
          isLoading={projectsPending}
          hasError={Boolean(projectsError)}
        />
        <Stat
          label="Active"
          value={activeCount}
          detail={`${planningCount} planning · ${completedCount} completed`}
          isLoading={projectsPending}
          hasError={Boolean(projectsError)}
        />
        <Stat
          label="Members"
          value={members.length}
          detail={`${pluralize(managerCount, "owner or admin", "owners and admins")}`}
          isLoading={membersPending}
          hasError={Boolean(membersError)}
        />
      </dl>

      <div className="grid items-start gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="dashboard-projects-heading">
          <SectionHeader
            title={<span id="dashboard-projects-heading">Projects</span>}
            className="mb-2"
            action={
              projects.length > 0 && (
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1 rounded-sm text-[13px] text-muted-foreground transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  View all
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              )
            }
          />
          <Panel>
            {projectsPending ? (
              <ListSkeleton rows={4} />
            ) : projectsError ? (
              <EmptyState
                icon={CircleAlert}
                title="Couldn't load projects"
                description="Something went wrong while fetching this organization's projects."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchProjects()}
                  >
                    Retry
                  </Button>
                }
              />
            ) : projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description={
                  canCreateProject
                    ? "Create your first project to start organizing your team's work."
                    : "Projects created by an owner or admin will appear here."
                }
                action={
                  canCreateProject && (
                    <Button size="sm" onClick={openCreateProject}>
                      <Plus />
                      Create project
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <StatusBreakdown projects={projects} />
                <ul>
                  {recentProjects.map((project) => (
                    <li
                      key={project.id}
                      className="border-b border-border last:border-0"
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        className="group flex min-h-[52px] items-center gap-3 px-4 py-2 transition-colors duration-150 ease-out outline-none hover:bg-accent/50 focus-visible:bg-accent/50"
                      >
                        <ProjectStatusIcon status={project.status} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {project.name}
                          </span>
                          {project.description && (
                            <span className="block truncate text-[13px] text-muted-foreground">
                              {project.description}
                            </span>
                          )}
                        </span>
                        <time
                          dateTime={project.updatedAt}
                          title={formatDate(project.updatedAt)}
                          className="shrink-0 text-xs text-muted-foreground"
                        >
                          {formatRelativeTime(project.updatedAt)}
                        </time>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>
        </section>

        <section aria-labelledby="dashboard-activity-heading">
          <SectionHeader
            title={<span id="dashboard-activity-heading">Recent activity</span>}
            className="mb-2"
          />
          {projectsPending || membersPending ? (
            <div className="glass-surface flex flex-col gap-5 rounded-xl border px-4 py-4" role="status" aria-label="Loading activity">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="mt-1 size-2 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3.5 w-36" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <Panel>
              <EmptyState
                title="Nothing happening yet"
                description="Create a project or bring in your team, and activity will appear here."
                action={
                  canCreateProject && (
                    <Button size="sm" variant="outline" onClick={openCreateProject}>
                      Create project
                    </Button>
                  )
                }
              />
            </Panel>
          ) : (
            <ol className="glass-surface rounded-xl border px-4 py-4">
              {activity.map((event, index) => (
                <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {index < activity.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-4 bottom-0 left-[3.5px] w-px bg-border"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative mt-[5px] size-2 shrink-0 rounded-full border",
                      index === 0
                        ? "border-brand bg-brand"
                        : "border-input bg-background"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-[18px] text-muted-foreground">
                      {event.title}
                    </p>
                    {event.href ? (
                      <Link
                        href={event.href}
                        className="block truncate rounded-sm text-[13px] leading-5 font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40"
                      >
                        {event.subject}
                      </Link>
                    ) : (
                      <p className="truncate text-[13px] leading-5 font-medium text-foreground">
                        {event.subject}
                      </p>
                    )}
                    <time
                      dateTime={event.at}
                      title={formatDate(event.at)}
                      className="text-xs text-muted-foreground"
                    >
                      {formatRelativeTime(event.at)}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
