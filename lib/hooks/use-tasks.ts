import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import {
  createTask,
  deleteTask,
  getOrganizationTasks,
  getProjectTasks,
  getTask,
  updateTask,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/lib/api/tasks";

export function projectTasksQueryKey(projectId: string | null | undefined) {
  return ["project-tasks", projectId] as const;
}

export function organizationTasksQueryKey(
  organizationId: string | null | undefined
) {
  return ["organization-tasks", organizationId] as const;
}

export function taskQueryKey(taskId: string | null | undefined) {
  return ["task", taskId] as const;
}

/**
 * Fetches a project's tasks. Disabled while no project is given, so a missing
 * id never fires a request or leaves another project's tasks on screen.
 */
export function useProjectTasks(projectId: string | null | undefined) {
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: projectTasksQueryKey(projectId),
    queryFn: () => getProjectTasks(projectId as string),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (error && process.env.NODE_ENV !== "production") {
      console.error("Failed to load tasks:", error);
    }
  }, [error]);

  return {
    tasks: data ?? [],
    isLoading: Boolean(projectId) && isPending,
    isFetching,
    error: error ?? null,
    refetch,
  };
}

/**
 * Fetches every task the user can see across an organization. Disabled while
 * no organization is selected.
 *
 * Deliberately has no `staleTime`: tasks are created, edited and deleted on
 * the project pages, and this list must reflect that the next time it is
 * opened rather than serving a cached copy.
 */
export function useOrganizationTasks(organizationId: string | null | undefined) {
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: organizationTasksQueryKey(organizationId),
    queryFn: () => getOrganizationTasks(organizationId as string),
    enabled: Boolean(organizationId),
  });

  useEffect(() => {
    if (error && process.env.NODE_ENV !== "production") {
      console.error("Failed to load organization tasks:", error);
    }
  }, [error]);

  return {
    tasks: data ?? [],
    isLoading: Boolean(organizationId) && isPending,
    isFetching,
    error: error ?? null,
    refetch,
  };
}

/**
 * Fetches a single task along with its project. A 4xx (not found, no access)
 * is a definitive answer, so it isn't retried.
 */
export function useTask(taskId: string | null | undefined) {
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: taskQueryKey(taskId),
    queryFn: () => getTask(taskId as string),
    enabled: Boolean(taskId),
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
    task: data ?? null,
    isLoading: Boolean(taskId) && isPending,
    isFetching,
    error: error ?? null,
    refetch,
  };
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: CreateTaskInput;
    }) => createTask(projectId, input),
    onSuccess: (_task, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectTasksQueryKey(projectId),
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      input,
    }: {
      taskId: string;
      input: UpdateTaskInput;
    }) => updateTask(taskId, input),
    // The updated task comes back with its projectId, which is all that's
    // needed to find the list it belongs to.
    onSuccess: (task) => {
      queryClient.invalidateQueries({
        queryKey: projectTasksQueryKey(task.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: taskQueryKey(task.id),
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    // The delete response carries no task, so the caller passes the
    // projectId it already has from the task being deleted.
    mutationFn: ({ taskId }: { taskId: string; projectId: string }) =>
      deleteTask(taskId),
    onSuccess: (_result, { taskId, projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectTasksQueryKey(projectId),
      });
      // Dropped rather than invalidated: refetching a deleted task would
      // only produce a 404.
      queryClient.removeQueries({
        queryKey: taskQueryKey(taskId),
      });
    },
  });
}
