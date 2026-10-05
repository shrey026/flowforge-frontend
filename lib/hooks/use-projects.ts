import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import {
  addProjectMember,
  createProject,
  deleteProject,
  getOrganizationProjects,
  getProjectById,
  removeProjectMember,
  updateProject,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/api/projects";

export function projectsQueryKey(organizationId: string | null | undefined) {
  return ["projects", organizationId] as const;
}

export function projectQueryKey(projectId: string | null | undefined) {
  return ["project", projectId] as const;
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

/**
 * Fetches a single project with its members and the requester's role. A 4xx
 * (not found, no access) is a definitive answer, so it isn't retried.
 */
export function useProject(projectId: string | null | undefined) {
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: projectQueryKey(projectId),
    queryFn: () => getProjectById(projectId as string),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
    retry: (failureCount, queryError) => {
      const status = isAxiosError(queryError)
        ? queryError.response?.status
        : undefined;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 3;
    },
  });

  return {
    project: data ?? null,
    isLoading: Boolean(projectId) && isPending,
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
    onSuccess: (_project, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectsQueryKey(organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: projectQueryKey(projectId),
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

/**
 * Project members are read from the project details response, so both
 * mutations refresh that query. The invalidation is returned so the mutation
 * stays pending until the refreshed list has arrived.
 */
export function useAddProjectMember(projectId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      addProjectMember(projectId as string, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: projectQueryKey(projectId),
      }),
  });
}

export function useRemoveProjectMember(projectId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      removeProjectMember(projectId as string, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: projectQueryKey(projectId),
      }),
  });
}
