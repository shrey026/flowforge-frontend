"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { ChevronsUpDown, MoreHorizontal, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrganizationMember } from "@/lib/api/members";
import type { OrganizationRole } from "@/lib/api/organizations";
import {
  useRemoveOrganizationMember,
  useUpdateOrganizationMemberRole,
} from "@/lib/hooks/use-organization-members";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
  return initials.join("") || "?";
}

function formatRole(role: OrganizationRole): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatJoinedDate(joinedAt: string): string {
  return new Date(joinedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function roleBadgeVariant(role: OrganizationRole): "default" | "secondary" | "outline" {
  if (role === "OWNER") return "default";
  if (role === "ADMIN") return "secondary";
  return "outline";
}

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead className="hidden sm:table-cell">Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="hidden md:table-cell">Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <MemberRow
            key={member.membershipId}
            member={member}
            requesterRole={requesterRole}
            isSelf={member.userId === currentUserId}
            organizationId={organizationId}
          />
        ))}
      </TableBody>
    </Table>
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
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
              <span className="truncate">{member.name}</span>
              {isSelf && (
                <Badge variant="outline" className="shrink-0">
                  You
                </Badge>
              )}
            </span>
            <span className="truncate text-xs text-muted-foreground sm:hidden">
              {member.email}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden text-muted-foreground sm:table-cell">
        {member.email}
      </TableCell>

      <TableCell>
        {canChangeRole ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updateRole.isPending}
                  className="gap-1"
                />
              }
            >
              {updateRole.isPending ? "Updating…" : formatRole(member.role)}
              <ChevronsUpDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
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
                      {formatRole(role)}
                    </DropdownMenuRadioItem>
                  )
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant={roleBadgeVariant(member.role)}>
            {formatRole(member.role)}
          </Badge>
        )}
        {updateRole.isError && (
          <p className="mt-1 max-w-40 text-xs text-destructive">
            {getErrorMessage(updateRole.error, "Couldn't update role.")}
          </p>
        )}
      </TableCell>

      <TableCell className="hidden text-muted-foreground md:table-cell">
        {formatJoinedDate(member.joinedAt)}
      </TableCell>

      <TableCell className="text-right">
        {canRemove && (
          <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${member.name}`}
                />
              }
            >
              <Trash2 className="size-4" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove member?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove {member.name} from this
                  organization?
                </DialogDescription>
              </DialogHeader>
              {removeMember.isError && (
                <p className="text-sm text-destructive">
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
        )}
        {!canRemove && !canChangeRole && (
          <MoreHorizontal className="ml-auto size-4 text-muted-foreground/40" />
        )}
      </TableCell>
    </TableRow>
  );
}
