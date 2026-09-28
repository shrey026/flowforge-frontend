import { isAxiosError } from "axios";

export interface ApiErrorResponse {
  status: "error";
  message: string;
  errors?: Record<string, string[] | undefined>;
}

/**
 * Extracts a human-readable message from an Axios error using the backend's
 * `{ status: "error", message }` response shape, falling back to a generic
 * message for network failures or unexpected error shapes.
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (!error.response) {
      return "Unable to reach the server. Please check your connection and try again.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
