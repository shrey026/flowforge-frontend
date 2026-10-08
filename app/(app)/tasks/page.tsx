"use client";

import { useState } from "react";
import { CircleAlert, ListChecks, SearchX } from "lucide-react";

import { PageHeader, Panel } from "@/components/layout/page-header";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import {
  EMPTY_TASK_FILTERS,
  TaskFilterBar,
  applyTaskFilters,
  hasActiveFilters,
  type TaskFilters,
} from "@/components/tasks/task-filters";
import { TaskBoard, TaskBoardSkeleton } from "@/components/tasks/task-board";
import { TaskList, TaskListSkeleton } from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs, type FilterTabOption } from "@/components/ui/filter-tabs";
import { useOrganizationTasks } from "@/lib/hooks/use-tasks";

type TaskView = "board" | "list";

const VIEW_OPTIONS: FilterTabOption<TaskView>[] = [
  { value: "board", label: "Board" },
  { value: "list", label: "List" },
];

function pluralizeTasks(count: number): string {
  return `${count} ${count === 1 ? "task" : "tasks"}`;
}

function TasksHeader() {
  return (
    <PageHeader title="Tasks" description="All tasks across your workspace" />
  );
}

export default function TasksPage() {
  const { activeOrganization, isLoading: isOrganizationLoading } =
    useOrganizationContext();

  if (!activeOrganization) {
    return (
      <div className="flex flex-col gap-6">
        <TasksHeader />
        {isOrganizationLoading ? (
          <TaskBoardSkeleton />
        ) : (
          <Panel>
            <EmptyState
              icon={ListChecks}
              title="No organization selected"
              description="Select an organization to view its tasks."
            />
          </Panel>
        )}
      </div>
    );
  }

  // Keyed so switching organization starts with a clean search and filters.
  return (
    <TasksWorkspace
      key={activeOrganization.id}
      organizationId={activeOrganization.id}
    />
  );
}

function TasksWorkspace({ organizationId }: { organizationId: string }) {
  const { tasks, isLoading, error, refetch } =
    useOrganizationTasks(organizationId);

  const [view, setView] = useState<TaskView>("board");
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_TASK_FILTERS);

  // The response is already limited to what this user may see, so tasks are
  // rendered as received; filters below only narrow the loaded set.
  const filteredTasks = applyTaskFilters(tasks, filters);
  const isFiltering = hasActiveFilters(filters);
  const isLoaded = !isLoading && !error;

  const summary = !isLoaded
    ? ""
    : isFiltering
      ? `Showing ${filteredTasks.length} of ${pluralizeTasks(tasks.length)}`
      : pluralizeTasks(tasks.length);

  const clearFilters = () => setFilters(EMPTY_TASK_FILTERS);

  return (
    <div className="flex flex-col gap-6">
      <TasksHeader />

      <FilterTabs
        aria-label="Task view"
        options={VIEW_OPTIONS}
        value={view}
        onValueChange={setView}
      />

      {isLoaded && tasks.length > 0 && (
        <TaskFilterBar
          tasks={tasks}
          filters={filters}
          onChange={setFilters}
          summary={summary}
        />
      )}

      {isLoading ? (
        view === "board" ? (
          <TaskBoardSkeleton />
        ) : (
          <TaskListSkeleton />
        )
      ) : error ? (
        <Panel>
          <EmptyState
            icon={CircleAlert}
            title="Couldn't load tasks"
            description="Something went wrong while fetching your tasks."
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        </Panel>
      ) : tasks.length === 0 ? (
        <Panel>
          <EmptyState
            icon={ListChecks}
            title="No tasks yet"
            description="Tasks from your projects will appear here."
          />
        </Panel>
      ) : filteredTasks.length === 0 ? (
        <Panel>
          <EmptyState
            icon={SearchX}
            title="No matching tasks"
            description="Try adjusting your filters or search."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </Panel>
      ) : view === "board" ? (
        <TaskBoard tasks={filteredTasks} />
      ) : (
        <TaskList tasks={filteredTasks} />
      )}
    </div>
  );
}
