import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProject,
  deleteProject,
  getOrganizationProjects,
  updateProject,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/api/projects";

export function projectsQueryKey(organizationId: string | null | undefined) {
  return ["projects", organizationId] as const;
}

/**
 * Fetches the active organization's projects. Disabled while no organization
 * is selected, so switching organizations (or having none) never leaves a
 * stale project list on screen.
 */
export function useProjects(organizationId: string | null | undefined) {
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: projectsQueryKey(organizationId),
    queryFn: () => getOrganizationProjects(organizationId as string),
    enabled: Boolean(organizationId),
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (error && process.env.NODE_ENV !== "production") {
      console.error("Failed to load projects:", error);
    }
  }, [error]);

  return {
    projects: data ?? [],
    isLoading: Boolean(organizationId) && isPending,
    isFetching,
    error: error ?? null,
    refetch,
  };
}

export function useCreateProject(organizationId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      createProject(organizationId as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectsQueryKey(organizationId),
      });
    },
  });
}

export function useUpdateProject(organizationId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: UpdateProjectInput;
    }) => updateProject(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectsQueryKey(organizationId),
      });
    },
  });
}

export function useDeleteProject(organizationId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId }: { projectId: string }) =>
      deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectsQueryKey(organizationId),
      });
    },
  });
}
