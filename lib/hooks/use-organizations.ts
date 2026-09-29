import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrganizations } from "@/lib/api/organizations";

export const organizationsQueryKey = ["organizations"] as const;

/**
 * Fetches the authenticated user's organizations. Requires an active
 * session, so callers should only mount this within the authenticated
 * application area.
 */
export function useOrganizations() {
  const { data, isPending, isFetching, error } = useQuery({
    queryKey: organizationsQueryKey,
    queryFn: getOrganizations,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (error && process.env.NODE_ENV !== "production") {
      console.error("Failed to load organizations:", error);
    }
  }, [error]);

  return {
    organizations: data ?? [],
    // `isPending` is true until we have data or an error, regardless of
    // fetch status. TanStack Query v5's `isLoading` is `isPending &&
    // isFetching`, which can read `false` before a fetch is flagged as
    // in-flight — that gap made the UI fall through to the "no
    // organizations" empty state instead of showing a loading state.
    isLoading: isPending,
    isFetching,
    error: error ?? null,
  };
}
