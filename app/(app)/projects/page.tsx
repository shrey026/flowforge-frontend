"use client";

import { FolderKanban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { ProjectsTable } from "@/components/project/projects-table";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import { canManageOrganization } from "@/lib/api/organizations";
import { useProjects } from "@/lib/hooks/use-projects";

function ProjectsTableSkeleton() {
  return (
    <Table>
      <TableBody>
        {Array.from({ length: 4 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Skeleton className="h-4 w-48" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-20" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="ml-auto h-6 w-6" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function ProjectsPage() {
  const { activeOrganization, isLoading: isOrganizationLoading } =
    useOrganizationContext();
  const { projects, isLoading, error, refetch } = useProjects(
    activeOrganization?.id
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize and track your team&apos;s projects.
          </p>
        </div>
        {activeOrganization && canManageOrganization(activeOrganization.role) && (
          <CreateProjectDialog
            organizationId={activeOrganization.id}
            requesterRole={activeOrganization.role}
          />
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {!activeOrganization ? (
            isOrganizationLoading ? (
              <ProjectsTableSkeleton />
            ) : (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <FolderKanban className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  No organization selected
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Select an organization to view its projects.
                </p>
              </div>
            )
          ) : isLoading ? (
            <ProjectsTableSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <FolderKanban className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Couldn&apos;t load projects
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Something went wrong while fetching this organization&apos;s
                projects.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <FolderKanban className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                No projects yet
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Create your first project to start organizing your team&apos;s
                work.
              </p>
            </div>
          ) : (
            <ProjectsTable
              projects={projects}
              requesterRole={activeOrganization.role}
              organizationId={activeOrganization.id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
