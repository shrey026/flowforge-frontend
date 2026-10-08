"use client";

import { ChevronDown, Search, X } from "lucide-react";

import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABEL,
  TASK_STATUSES,
  TASK_STATUS_LABEL,
} from "@/components/project/task-meta";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { GlobalTask, TaskPriority, TaskStatus } from "@/lib/api/tasks";

export const ALL = "ALL";
export const UNASSIGNED = "UNASSIGNED";

export interface TaskFilters {
  query: string;
  status: TaskStatus | typeof ALL;
  priority: TaskPriority | typeof ALL;
  /** A user id, `UNASSIGNED`, or `ALL`. */
  assignee: string;
  /** A project id, or `ALL`. */
  project: string;
}

export const EMPTY_TASK_FILTERS: TaskFilters = {
  query: "",
  status: ALL,
  priority: ALL,
  assignee: ALL,
  project: ALL,
};

export function hasActiveFilters(filters: TaskFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.status !== ALL ||
    filters.priority !== ALL ||
    filters.assignee !== ALL ||
    filters.project !== ALL
  );
}

/** Filters combine with AND; the search text must also match. */
export function applyTaskFilters(
  tasks: GlobalTask[],
  filters: TaskFilters
): GlobalTask[] {
  const query = filters.query.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.status !== ALL && task.status !== filters.status) return false;
    if (filters.priority !== ALL && task.priority !== filters.priority) {
      return false;
    }
    if (filters.project !== ALL && task.project.id !== filters.project) {
      return false;
    }
    if (filters.assignee === UNASSIGNED) {
      if (task.assigneeId !== null) return false;
    } else if (filters.assignee !== ALL && task.assigneeId !== filters.assignee) {
      return false;
    }

    if (!query) return true;

    return [
      task.title,
      task.description,
      task.project.name,
      task.assignee?.name,
      task.assignee?.email,
    ].some((field) => field?.toLowerCase().includes(query));
  });
}

interface Option {
  value: string;
  label: string;
}

function FilterMenu({
  label,
  allLabel,
  value,
  options,
  onValueChange,
}: {
  label: string;
  allLabel: string;
  value: string;
  options: Option[];
  onValueChange: (value: string) => void;
}) {
  const isActive = value !== ALL;
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={`Filter by ${label.toLowerCase()}${
              isActive && selectedLabel ? `: ${selectedLabel}` : ""
            }`}
            className="max-w-48"
          />
        }
      >
        <span className="truncate">
          {isActive ? (
            <>
              <span className="text-muted-foreground">{label}: </span>
              {selectedLabel}
            </>
          ) : (
            label
          )}
        </span>
        <ChevronDown
          className="size-3 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 min-w-48">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          <DropdownMenuRadioItem value={ALL}>{allLabel}</DropdownMenuRadioItem>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <span className="truncate">{option.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Search box and filter menus. Options for assignee and project are drawn from the loaded tasks. */
export function TaskFilterBar({
  tasks,
  filters,
  onChange,
  summary,
}: {
  tasks: GlobalTask[];
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  summary: string;
}) {
  const assignees = new Map<string, string>();
  const projects = new Map<string, string>();
  for (const task of tasks) {
    if (task.assignee) assignees.set(task.assignee.id, task.assignee.name);
    projects.set(task.project.id, task.project.name);
  }

  const byLabel = (a: Option, b: Option) => a.label.localeCompare(b.label);
  const assigneeOptions: Option[] = [
    { value: UNASSIGNED, label: "Unassigned" },
    ...[...assignees].map(([value, label]) => ({ value, label })).sort(byLabel),
  ];
  const projectOptions: Option[] = [...projects]
    .map(([value, label]) => ({ value, label }))
    .sort(byLabel);

  const set = (patch: Partial<TaskFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={filters.query}
          onChange={(event) => set({ query: event.target.value })}
          placeholder="Search tasks"
          aria-label="Search tasks by title, description, project or assignee"
          className="pl-8"
        />
      </div>

      <FilterMenu
        label="Status"
        allLabel="All statuses"
        value={filters.status}
        options={TASK_STATUSES.map((value) => ({
          value,
          label: TASK_STATUS_LABEL[value],
        }))}
        onValueChange={(value) => set({ status: value as TaskStatus })}
      />
      <FilterMenu
        label="Priority"
        allLabel="All priorities"
        value={filters.priority}
        options={TASK_PRIORITIES.map((value) => ({
          value,
          label: TASK_PRIORITY_LABEL[value],
        }))}
        onValueChange={(value) => set({ priority: value as TaskPriority })}
      />
      <FilterMenu
        label="Assignee"
        allLabel="Anyone"
        value={filters.assignee}
        options={assigneeOptions}
        onValueChange={(value) => set({ assignee: value })}
      />
      <FilterMenu
        label="Project"
        allLabel="All projects"
        value={filters.project}
        options={projectOptions}
        onValueChange={(value) => set({ project: value })}
      />

      {hasActiveFilters(filters) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(EMPTY_TASK_FILTERS)}
        >
          <X />
          Clear filters
        </Button>
      )}

      <p
        aria-live="polite"
        className="w-full text-xs text-muted-foreground tabular-nums sm:ml-auto sm:w-auto"
      >
        {summary}
      </p>
    </div>
  );
}
