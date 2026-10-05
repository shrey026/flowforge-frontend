"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import { PageHeader, Panel } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs, type FilterTabOption } from "@/components/ui/filter-tabs";
import { cn } from "@/lib/utils";

type TaskView = "board" | "list" | "timeline";

const VIEW_OPTIONS: FilterTabOption<TaskView>[] = [
  { value: "board", label: "Board" },
  { value: "list", label: "List" },
  { value: "timeline", label: "Timeline", disabled: true, hint: "Soon" },
];

// The workflow stages tasks move through. These are structure, not data: no
// task counts are shown because this screen doesn't load tasks yet.
const TASK_STAGES = [
  { id: "BACKLOG", label: "Backlog", marker: "border border-dashed border-muted-foreground/60" },
  { id: "TODO", label: "Todo", marker: "border border-muted-foreground/60" },
  { id: "IN_PROGRESS", label: "In progress", marker: "bg-warning" },
  { id: "IN_REVIEW", label: "In review", marker: "bg-brand" },
  { id: "DONE", label: "Done", marker: "bg-foreground/55" },
] as const;

export default function TasksPage() {
  const [view, setView] = useState<TaskView>("board");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tasks"
        description="Track work across your projects, from backlog to done."
      />

      <FilterTabs
        aria-label="Task view"
        options={VIEW_OPTIONS}
        value={view}
        onValueChange={setView}
      />

      <p className="glass-surface flex items-start gap-2 rounded-md border px-3 py-2.5 text-[13px] leading-5 text-muted-foreground">
        <Info className="mt-[3px] size-3.5 shrink-0" aria-hidden="true" />
        <span>
          <span className="font-medium text-foreground">
            Tasks aren&apos;t available in the app yet.
          </span>{" "}
          This is how they&apos;ll be organized once they are.
        </span>
      </p>

      {view === "board" ? (
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <ol className="grid min-w-[56rem] grid-cols-5 gap-3" aria-label="Task stages">
            {TASK_STAGES.map((stage) => (
              <li key={stage.id} className="flex flex-col gap-2">
                <div className="flex h-7 items-center gap-2 px-1">
                  <span
                    aria-hidden="true"
                    className={cn("size-2 shrink-0 rounded-full", stage.marker)}
                  />
                  <h2 className="eyebrow">{stage.label}</h2>
                </div>
                <div
                  aria-hidden="true"
                  className="h-64 rounded-xl glass-surface border border-dashed"
                />
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <Panel>
          <div
            aria-hidden="true"
            className="hidden h-9 grid-cols-[minmax(0,1fr)_9rem_9rem_7rem] items-center gap-x-4 border-b border-border px-4 md:grid"
          >
            <span className="eyebrow">Task</span>
            <span className="eyebrow">Stage</span>
            <span className="eyebrow">Assignee</span>
            <span className="eyebrow">Due</span>
          </div>
          <EmptyState
            title="Tasks will appear here"
            description="Once tasks are available in the app, they'll be listed here by stage."
          />
        </Panel>
      )}
    </div>
  );
}
