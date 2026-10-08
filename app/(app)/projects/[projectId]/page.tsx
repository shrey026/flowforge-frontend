"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { ArrowLeft, CircleAlert, FileQuestion, Trash2 } from "lucide-react";

import {
  PageHeader,
  Panel,
  Property,
  SectionHeader,
} from "@/components/layout/page-header";
import {
  DeleteProjectDialog,
  ProjectStatusControl,
} from "@/components/project/project-actions";
import { ProjectMembers } from "@/components/project/project-members";
import { ProjectTasks } from "@/components/project/project-tasks";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { canManageOrganization } from "@/lib/api/organizations";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { useProject } from "@/lib/hooks/use-projects";

function BackLink() {
  return (
    <Link
      href="/projects"
      className="inline-flex w-fit items-center gap-1.5 rounded-sm text-[13px] text-muted-foreground transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <ArrowLeft className="size-3.5" aria-hidden="true" />
      All projects
    </Link>
  );
}

function ProjectDetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading project">
      <Skeleton className="h-7 w-64 max-w-full" />
      <Skeleton className="mt-3 h-3.5 w-96 max-w-full" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const { project, isLoading, error, refetch } = useProject(projectId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const errorStatus = isAxiosError(error) ? error.response?.status : undefined;

  // Checked before `project` on purpose: a cached copy can outlive a project
  // that has since been deleted or become inaccessible.
  if (error) {
    const isMissing = errorStatus === 404 || errorStatus === 403;

    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <Panel>
          {isMissing ? (
            <EmptyState
              icon={FileQuestion}
              title="Project not found"
              description="It may have been deleted, or you might not have access to it."
              action={
                <Link
                  href="/projects"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Back to projects
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={CircleAlert}
              title="Couldn't load this project"
              description="Something went wrong while fetching the project."
              action={
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            />
          )}
        </Panel>
      </div>
    );
  }

  if (isLoading || !project) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <ProjectDetailsSkeleton />
      </div>
    );
  }

  const canManage = canManageOrganization(project.requesterRole);

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <PageHeader
        title={project.name}
        description={project.description || "No description"}
        actions={
          canManage && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 />
              Delete
            </Button>
          )
        }
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <ProjectTasks project={project} />
          <ProjectMembers project={project} />
        </div>

        <section aria-labelledby="project-details-heading">
          <SectionHeader
            title={<span id="project-details-heading">Details</span>}
            className="mb-2"
          />
          <Panel>
            <dl>
              <Property label="Status">
                <ProjectStatusControl
                  project={project}
                  canManage={canManage}
                  organizationId={project.organizationId}
                />
              </Property>
              <Property label="Workspace">{project.organization.name}</Property>
              <Property label="Created">{formatDate(project.createdAt)}</Property>
              <Property label="Updated">
                <time dateTime={project.updatedAt} title={formatDate(project.updatedAt)}>
                  {formatRelativeTime(project.updatedAt)}
                </time>
              </Property>
            </dl>
          </Panel>
        </section>
      </div>

      {canManage && (
        <DeleteProjectDialog
          project={project}
          organizationId={project.organizationId}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleted={() => router.push("/projects")}
        />
      )}
    </div>
  );
}
