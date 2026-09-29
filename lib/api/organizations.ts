import { apiClient } from "./client";

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  role: OrganizationRole;
  membershipId: string;
  joinedAt: string;
}

interface OrganizationsResponse {
  status: "success";
  data: {
    organizations: Organization[];
  };
}

export async function getOrganizations(): Promise<Organization[]> {
  const response = await apiClient.get<OrganizationsResponse>(
    "/organizations"
  );

  return response.data.data.organizations;
}
