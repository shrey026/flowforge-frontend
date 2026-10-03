import { apiClient } from "./client";

export type ProjectStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemberSummary {
  id: string;
  userId: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface ProjectDetails extends Project {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  members: ProjectMemberSummary[];
  requesterRole: "OWNER" | "ADMIN" | "MEMBER";
}

interface ProjectsResponse {
  status: "success";
  data: {
    projects: Project[];
  };
}

interface ProjectResponse {
  status: "success";
  message?: string;
  data: {
    project: Project;
  };
}

interface ProjectDetailsResponse {
  status: "success";
  data: {
    project: ProjectDetails;
  };
}

export async function getOrganizationProjects(
  organizationId: string
): Promise<Project[]> {
  const response = await apiClient.get<ProjectsResponse>(
    `/organizations/${organizationId}/projects`
  );

  return response.data.data.projects;
}

export async function getProjectById(
  projectId: string
): Promise<ProjectDetails> {
  const response = await apiClient.get<ProjectDetailsResponse>(
    `/projects/${projectId}`
  );

  return response.data.data.project;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export async function createProject(
  organizationId: string,
  input: CreateProjectInput
): Promise<Project> {
  const response = await apiClient.post<ProjectResponse>(
    `/organizations/${organizationId}/projects`,
    input
  );

  return response.data.data.project;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
): Promise<Project> {
  const response = await apiClient.patch<ProjectResponse>(
    `/projects/${projectId}`,
    input
  );

  return response.data.data.project;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`);
}
