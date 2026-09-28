import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getCurrentUser, logoutUser } from "@/lib/api/auth";

export const authQueryKey = ["auth", "me"] as const;

/**
 * Source of truth for server-side authentication state. A 401 from
 * /auth/me simply means "not logged in", so it isn't retried and is
 * treated as `isAuthenticated: false` rather than a surfaced error.
 */
export function useAuth() {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 60 * 1000,
  });

  const isUnauthorized = isAxiosError(error) && error.response?.status === 401;

  return {
    user: data ?? null,
    isLoading,
    isFetching,
    isAuthenticated: Boolean(data),
    error: isUnauthorized ? null : (error ?? null),
  };
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(authQueryKey, null);
      queryClient.removeQueries({ queryKey: authQueryKey });
      router.push("/login");
    },
  });
}
