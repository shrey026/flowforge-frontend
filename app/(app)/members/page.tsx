"use client";

import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { MembersTable } from "@/components/organization/members-table";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import { useAuth } from "@/lib/hooks/use-auth";
import { useOrganizationMembers } from "@/lib/hooks/use-organization-members";

function MembersTableSkeleton() {
  return (
    <Table>
      <TableBody>
        {Array.from({ length: 4 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Skeleton className="h-4 w-40" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-16" />
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

export default function MembersPage() {
  const { user } = useAuth();
  const { activeOrganization, isLoading: isOrganizationLoading } =
    useOrganizationContext();
  const {
    members,
    requesterRole,
    isLoading,
    error,
    refetch,
  } = useOrganizationMembers(activeOrganization?.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Members</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage members and their roles in this organization.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {!activeOrganization ? (
            isOrganizationLoading ? (
              <MembersTableSkeleton />
            ) : (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <Users className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  No organization selected
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Select an organization to view its members.
                </p>
              </div>
            )
          ) : isLoading ? (
            <MembersTableSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Users className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Couldn&apos;t load members
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Something went wrong while fetching this organization&apos;s
                members.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Users className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                No members yet
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                This organization doesn&apos;t have any members yet.
              </p>
            </div>
          ) : (
            <MembersTable
              members={members}
              requesterRole={requesterRole ?? "MEMBER"}
              currentUserId={user?.id ?? null}
              organizationId={activeOrganization.id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
