import { apiClient } from "./client";
import type { OrganizationRole } from "./organizations";

export interface OrganizationMember {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: OrganizationRole;
  joinedAt: string;
}

interface RawMember {
  id: string;
  userId: string;
  role: OrganizationRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

function toOrganizationMember(raw: RawMember): OrganizationMember {
  return {
    membershipId: raw.id,
    userId: raw.userId,
    name: raw.user.name,
    email: raw.user.email,
    avatarUrl: raw.user.avatarUrl,
    role: raw.role,
    joinedAt: raw.joinedAt,
  };
}

export interface OrganizationMembersResult {
  requesterRole: OrganizationRole;
  members: OrganizationMember[];
}

interface OrganizationMembersResponse {
  status: "success";
  data: {
    requesterRole: OrganizationRole;
    members: RawMember[];
  };
}

export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMembersResult> {
  const response = await apiClient.get<OrganizationMembersResponse>(
    `/organizations/${organizationId}/members`
  );

  return {
    requesterRole: response.data.data.requesterRole,
    members: response.data.data.members.map(toOrganizationMember),
  };
}

interface UpdateMemberRoleResponse {
  status: "success";
  message?: string;
  data: {
    member: RawMember;
  };
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  role: OrganizationRole
): Promise<OrganizationMember> {
  const response = await apiClient.patch<UpdateMemberRoleResponse>(
    `/organizations/${organizationId}/members/${userId}/role`,
    { role }
  );

  return toOrganizationMember(response.data.data.member);
}

export async function removeOrganizationMember(
  organizationId: string,
  userId: string
): Promise<void> {
  await apiClient.delete(`/organizations/${organizationId}/members/${userId}`);
}
