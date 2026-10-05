"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { CommandPalette } from "@/components/layout/command-palette";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import { canManageOrganization } from "@/lib/api/organizations";

interface WorkspaceActionsValue {
  openCommandPalette: () => void;
  openCreateProject: () => void;
  /** Mirrors the same role check the Projects page uses for its create button. */
  canCreateProject: boolean;
}

const WorkspaceActionsContext = createContext<
  WorkspaceActionsValue | undefined
>(undefined);

/**
 * Owns the UI state for workspace-wide surfaces (command palette, the create
 * project dialog) so the header, sidebar, palette and pages all open the same
 * instance. Holds no data of its own; organization and role still come from
 * the organization context.
 */
export function WorkspaceActionsProvider({ children }: { children: ReactNode }) {
  const { activeOrganization } = useOrganizationContext();
  const [commandOpen, setCommandOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const canCreateProject =
    activeOrganization !== null &&
    canManageOrganization(activeOrganization.role);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openCommandPalette = useCallback(() => setCommandOpen(true), []);
  const openCreateProject = useCallback(() => {
    if (canCreateProject) setCreateProjectOpen(true);
  }, [canCreateProject]);

  return (
    <WorkspaceActionsContext.Provider
      value={{ openCommandPalette, openCreateProject, canCreateProject }}
    >
      {children}

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        canCreateProject={canCreateProject}
        onCreateProject={openCreateProject}
      />

      {activeOrganization && canCreateProject && (
        <CreateProjectDialog
          key={activeOrganization.id}
          organizationId={activeOrganization.id}
          requesterRole={activeOrganization.role}
          open={createProjectOpen}
          onOpenChange={setCreateProjectOpen}
          showTrigger={false}
        />
      )}
    </WorkspaceActionsContext.Provider>
  );
}

export function useWorkspaceActions() {
  const context = useContext(WorkspaceActionsContext);

  if (!context) {
    throw new Error(
      "useWorkspaceActions must be used within a WorkspaceActionsProvider"
    );
  }

  return context;
}
