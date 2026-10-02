import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getOrganizationMembers,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from "@/lib/api/members";
import type { OrganizationRole } from "@/lib/api/organizations";

export function organizationMembersQueryKey(organizationId: string | null | undefined) {
  return ["organization-members", organizationId] as const;
}

/**
 * Fetches the active organization's members. Disabled while no organization
 * is selected, so switching organizations (or having none) never leaves a
 * stale member list on screen.
 */
export function useOrganizationMembers(organizationId: string | null | undefined) {
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: organizationMembersQueryKey(organizationId),
    queryFn: () => getOrganizationMembers(organizationId as string),
    enabled: Boolean(organizationId),
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (error && process.env.NODE_ENV !== "production") {
      console.error("Failed to load organization members:", error);
    }
  }, [error]);

  return {
    members: data?.members ?? [],
    requesterRole: data?.requesterRole ?? null,
    isLoading: Boolean(organizationId) && isPending,
    isFetching,
    error: error ?? null,
    refetch,
  };
}

export function useUpdateOrganizationMemberRole(organizationId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: OrganizationRole }) =>
      updateOrganizationMemberRole(organizationId as string, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationMembersQueryKey(organizationId),
      });
    },
  });
}

export function useRemoveOrganizationMember(organizationId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      removeOrganizationMember(organizationId as string, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationMembersQueryKey(organizationId),
      });
    },
  });
}
