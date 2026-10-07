import { apiClient } from "./client";

export type TaskStatus =
  | "BACKLOG"
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TaskUserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  createdById: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: TaskUserSummary | null;
  createdBy: TaskUserSummary;
}

/** Shape returned by `GET /tasks/:taskId`, which also includes the project. */
export interface TaskDetails extends Task {
  project: {
    id: string;
    name: string;
    organizationId: string;
  };
}

interface TasksResponse {
  status: "success";
  data: {
    tasks: Task[];
  };
}

interface TaskResponse {
  status: "success";
  message?: string;
  data: {
    task: Task;
  };
}

interface TaskDetailsResponse {
  status: "success";
  data: {
    task: TaskDetails;
  };
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const response = await apiClient.get<TasksResponse>(
    `/projects/${projectId}/tasks`
  );

  return response.data.data.tasks;
}

export async function getTask(taskId: string): Promise<TaskDetails> {
  const response = await apiClient.get<TaskDetailsResponse>(
    `/tasks/${taskId}`
  );

  return response.data.data.task;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
}

export async function createTask(
  projectId: string,
  input: CreateTaskInput
): Promise<Task> {
  const response = await apiClient.post<TaskResponse>(
    `/projects/${projectId}/tasks`,
    input
  );

  return response.data.data.task;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  /** `null` clears the assignee. */
  assigneeId?: string | null;
  /** `null` clears the due date. */
  dueDate?: string | null;
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput
): Promise<Task> {
  const response = await apiClient.patch<TaskResponse>(
    `/tasks/${taskId}`,
    input
  );

  return response.data.data.task;
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}`);
}
