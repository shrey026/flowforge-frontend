"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { isAxiosError } from "axios";
import { ChevronDown } from "lucide-react";

import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABEL,
  TASK_STATUSES,
  TASK_STATUS_LABEL,
  TaskStatusMarker,
} from "@/components/project/task-meta";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectMemberSummary } from "@/lib/api/projects";
import type {
  TaskPriority,
  TaskStatus,
  TaskUserSummary,
} from "@/lib/api/tasks";
import { getInitials } from "@/lib/format";

// Matches the title column's length in the database.
const TITLE_MAX_LENGTH = 191;
const UNASSIGNED = "unassigned";

export function getTaskErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** `null` means unassigned. */
  assigneeId: string | null;
  /** `YYYY-MM-DD`, or an empty string for no due date. */
  dueDate: string;
}

export const DEFAULT_TASK_FORM_VALUES: TaskFormValues = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  assigneeId: null,
  dueDate: "",
};

/** A form field whose value is picked from a menu, styled like an input. */
function MenuField<T extends string>({
  id,
  value,
  onValueChange,
  options,
  disabled,
}: {
  id: string;
  value: T;
  onValueChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  disabled?: boolean;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={id}
        disabled={disabled}
        className="flex h-8 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-card px-2.5 text-left text-[13px] text-foreground transition-[border-color,box-shadow] duration-150 ease-out outline-none hover:border-[color-mix(in_oklab,var(--input),var(--foreground)_18%)] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-60 aria-expanded:border-ring"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
          {selected?.label}
        </span>
        <ChevronDown
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-64">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onValueChange(next as T)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <span className="flex min-w-0 items-center gap-2">
                {option.label}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PersonOption({ person, note }: { person: TaskUserSummary; note?: string }) {
  return (
    <>
      <Avatar size="sm">
        {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt="" />}
        <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
      </Avatar>
      <span className="truncate">{person.name}</span>
      {note && (
        <span className="shrink-0 text-xs text-muted-foreground">{note}</span>
      )}
    </>
  );
}

interface TaskFormProps {
  initialValues: TaskFormValues;
  /** Only project members can be assigned. */
  members: ProjectMemberSummary[];
  /**
   * The task's existing assignee, when editing. Kept selectable-as-current
   * even if they have since been removed from the project.
   */
  currentAssignee?: TaskUserSummary | null;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  errorMessage: string | null;
  onSubmit: (values: TaskFormValues) => void;
}

/** The fields shared by the New task and Edit task dialogs. */
export function TaskForm({
  initialValues,
  members,
  currentAssignee,
  submitLabel,
  pendingLabel,
  isPending,
  errorMessage,
  onSubmit,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [status, setStatus] = useState(initialValues.status);
  const [priority, setPriority] = useState(initialValues.priority);
  const [assigneeId, setAssigneeId] = useState(
    initialValues.assigneeId ?? UNASSIGNED
  );
  const [dueDate, setDueDate] = useState(initialValues.dueDate);
  const [titleError, setTitleError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError("Task title is required.");
      return;
    }

    setTitleError(null);

    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      status,
      priority,
      assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
      dueDate,
    });
  };

  const assigneeLeftProject =
    currentAssignee &&
    !members.some((member) => member.userId === currentAssignee.id);

  const assigneeOptions: { value: string; label: ReactNode }[] = [
    {
      value: UNASSIGNED,
      label: <span className="text-muted-foreground">Unassigned</span>,
    },
    ...(currentAssignee && assigneeLeftProject
      ? [
          {
            value: currentAssignee.id,
            label: <PersonOption person={currentAssignee} note="Not on project" />,
          },
        ]
      : []),
    ...members.map((member) => ({
      value: member.userId,
      label: <PersonOption person={member.user} />,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (titleError) setTitleError(null);
          }}
          maxLength={TITLE_MAX_LENGTH}
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? "task-title-error" : undefined}
          placeholder="What needs to be done?"
          autoFocus
        />
        {titleError && (
          <p id="task-title-error" className="text-xs text-destructive">
            {titleError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-description">
          Description
          <span className="font-normal text-muted-foreground">Optional</span>
        </Label>
        <textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="Add any detail that helps"
          className="w-full min-w-0 resize-y rounded-md border border-input bg-card px-2.5 py-1.5 text-base text-foreground transition-[border-color,box-shadow] duration-150 ease-out outline-none placeholder:text-muted-foreground/70 hover:border-[color-mix(in_oklab,var(--input),var(--foreground)_18%)] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 md:text-[13px]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-status">Status</Label>
          <MenuField
            id="task-status"
            value={status}
            onValueChange={setStatus}
            disabled={isPending}
            options={TASK_STATUSES.map((value) => ({
              value,
              label: (
                <>
                  <TaskStatusMarker status={value} />
                  {TASK_STATUS_LABEL[value]}
                </>
              ),
            }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-priority">Priority</Label>
          <MenuField
            id="task-priority"
            value={priority}
            onValueChange={setPriority}
            disabled={isPending}
            options={TASK_PRIORITIES.map((value) => ({
              value,
              label: TASK_PRIORITY_LABEL[value],
            }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-assignee">Assignee</Label>
          <MenuField
            id="task-assignee"
            value={assigneeId}
            onValueChange={setAssigneeId}
            disabled={isPending}
            options={assigneeOptions}
          />
          {members.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Add people to the project to assign tasks to them.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="task-due-date">
              Due date
              <span className="font-normal text-muted-foreground">Optional</span>
            </Label>
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate("")}
                className="rounded-sm text-xs leading-none text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                Clear
              </button>
            )}
          </div>
          <Input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
      </div>

      {errorMessage && (
        <p role="alert" className="text-[13px] text-destructive">
          {errorMessage}
        </p>
      )}

      <DialogFooter>
        <DialogClose
          render={<Button type="button" variant="outline" disabled={isPending} />}
        >
          Cancel
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
