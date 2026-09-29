"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { Organization } from "@/lib/api/organizations";
import { useOrganizations } from "@/lib/hooks/use-organizations";

const STORAGE_KEY = "flowforge_active_organization";

interface OrganizationContextValue {
  organizations: Organization[];
  activeOrganization: Organization | null;
  setActiveOrganization: (organization: Organization) => void;
  isLoading: boolean;
  error: unknown;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(
  undefined
);

function readStoredOrganizationId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredOrganizationId(id: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage may be unavailable (e.g. private browsing); the active
    // organization still works for the current session via component state.
  }
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { organizations, isLoading, error } = useOrganizations();

  // Only tracks an explicit selection made this session. The actual active
  // organization is derived below so there's no need to sync it via an
  // effect: it falls back to the stored id, then the first organization.
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    readStoredOrganizationId()
  );

  const activeOrganization =
    organizations.find((organization) => organization.id === selectedId) ??
    organizations[0] ??
    null;

  const setActiveOrganization = (organization: Organization) => {
    setSelectedId(organization.id);
    writeStoredOrganizationId(organization.id);
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrganization,
        setActiveOrganization,
        isLoading,
        error,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error(
      "useOrganizationContext must be used within an OrganizationProvider"
    );
  }

  return context;
}
