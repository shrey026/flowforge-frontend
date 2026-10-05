"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { ChevronDown, MoreHorizontal, UserMinus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrganizationMember } from "@/lib/api/members";
import type { OrganizationRole } from "@/lib/api/organizations";
import { formatDate, formatEnumLabel, getInitials } from "@/lib/format";
import {
  useRemoveOrganizationMember,
  useUpdateOrganizationMemberRole,
} from "@/lib/hooks/use-organization-members";
import { cn } from "@/lib/utils";

// Shared by the header, rows and skeleton so the columns always line up.
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto_1.75rem] items-center gap-x-4 px-4 md:grid-cols-[minmax(0,1fr)_8rem_8rem_1.75rem]";

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

/** Roles this row's requester is actually allowed to set on this member, per the backend's rules. */
function availableRolesFor(
  requesterRole: OrganizationRole,
  memberRole: OrganizationRole
): OrganizationRole[] {
  if (requesterRole === "OWNER") return ["ADMIN", "MEMBER"];
  if (requesterRole === "ADMIN" && memberRole === "ADMIN") return ["MEMBER"];
  return [];
}

function canRemoveMember(
  requesterRole: OrganizationRole,
  memberRole: OrganizationRole
): boolean {
  if (requesterRole === "OWNER") return true;
  if (requesterRole === "ADMIN") return memberRole === "MEMBER";
  return false;
}

interface MembersTableProps {
  members: OrganizationMember[];
  requesterRole: OrganizationRole;
  currentUserId: string | null;
  organizationId: string;
}

export function MembersTable({
  members,
  requesterRole,
  currentUserId,
  organizationId,
}: MembersTableProps) {
  return (
    <div>
      <MembersTableHeader />
      <ul>
        {members.map((member) => (
          <MemberRow
            key={member.membershipId}
            member={member}
            requesterRole={requesterRole}
            isSelf={member.userId === currentUserId}
            organizationId={organizationId}
          />
        ))}
      </ul>
    </div>
  );
}

function MembersTableHeader() {
  return (
    <div
      aria-hidden="true"
      className={cn(ROW_GRID, "hidden h-9 border-b border-border md:grid")}
    >
      <span className="eyebrow">Member</span>
      <span className="eyebrow">Role</span>
      <span className="eyebrow">Joined</span>
      <span />
    </div>
  );
}

export function MembersTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading members">
      <MembersTableHeader />
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={cn(ROW_GRID, "h-[60px] border-b border-border last:border-0")}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="hidden h-3 w-20 md:block" />
          <span />
        </div>
      ))}
    </div>
  );
}

function MemberRow({
  member,
  requesterRole,
  isSelf,
  organizationId,
}: {
  member: OrganizationMember;
  requesterRole: OrganizationRole;
  isSelf: boolean;
  organizationId: string;
}) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const updateRole = useUpdateOrganizationMemberRole(organizationId);
  const removeMember = useRemoveOrganizationMember(organizationId);

  const roleOptions = isSelf ? [] : availableRolesFor(requesterRole, member.role);
  const canChangeRole = roleOptions.length > 0;
  const canRemove = !isSelf && canRemoveMember(requesterRole, member.role);

  return (
    <li
      className={cn(
        ROW_GRID,
        "min-h-[60px] border-b border-border py-2.5 transition-colors duration-150 ease-out last:border-0 hover:bg-accent/50"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar>
          {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <span className="truncate">{member.name}</span>
            {isSelf && (
              <Badge variant="outline" className="shrink-0">
                You
              </Badge>
            )}
          </p>
          <p className="truncate text-[13px] text-muted-foreground">
            {member.email}
          </p>
        </div>
      </div>

      <div>
        {canChangeRole ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={updateRole.isPending}
                  aria-label={`Role of ${member.name}: ${formatEnumLabel(member.role)}. Change role`}
                  className="-ml-2 gap-1.5 px-2 font-normal text-foreground"
                />
              }
            >
              {updateRole.isPending ? "Updating…" : formatEnumLabel(member.role)}
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-36">
              <DropdownMenuRadioGroup
                value={member.role}
                onValueChange={(value) =>
                  updateRole.mutate({
                    userId: member.userId,
                    role: value as OrganizationRole,
                  })
                }
              >
                {[member.role, ...roleOptions.filter((role) => role !== member.role)].map(
                  (role) => (
                    <DropdownMenuRadioItem key={role} value={role}>
                      {formatEnumLabel(role)}
                    </DropdownMenuRadioItem>
                  )
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span
            className={cn(
              "text-[13px]",
              member.role === "MEMBER"
                ? "text-muted-foreground"
                : "text-foreground"
            )}
          >
            {formatEnumLabel(member.role)}
          </span>
        )}
        {updateRole.isError && (
          <p role="alert" className="mt-1 max-w-40 text-xs text-destructive">
            {getErrorMessage(updateRole.error, "Couldn't update role.")}
          </p>
        )}
      </div>

      <time
        dateTime={member.joinedAt}
        className="hidden truncate text-[13px] text-muted-foreground md:block"
      >
        {formatDate(member.joinedAt)}
      </time>

      {canRemove ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${member.name}`}
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setRemoveDialogOpen(true)}
              >
                <UserMinus />
                Remove member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove member?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove{" "}
                  <span className="font-medium text-foreground">
                    {member.name}
                  </span>{" "}
                  from this organization?
                </DialogDescription>
              </DialogHeader>
              {removeMember.isError && (
                <p role="alert" className="text-[13px] text-destructive">
                  {getErrorMessage(removeMember.error, "Couldn't remove member.")}
                </p>
              )}
              <DialogFooter>
                <DialogClose
                  render={
                    <Button variant="outline" disabled={removeMember.isPending} />
                  }
                >
                  Cancel
                </DialogClose>
                <Button
                  variant="destructive"
                  disabled={removeMember.isPending}
                  onClick={() =>
                    removeMember.mutate(
                      { userId: member.userId },
                      { onSuccess: () => setRemoveDialogOpen(false) }
                    )
                  }
                >
                  {removeMember.isPending ? "Removing…" : "Remove member"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <span />
      )}
    </li>
  );
}
