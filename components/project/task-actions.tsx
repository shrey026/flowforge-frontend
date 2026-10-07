"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  TaskForm,
  getTaskErrorMessage,
  type TaskFormValues,
} from "@/components/project/task-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectMemberSummary } from "@/lib/api/projects";
import type { Task, UpdateTaskInput } from "@/lib/api/tasks";
import { useDeleteTask, useUpdateTask } from "@/lib/hooks/use-tasks";

/** Row menu for a task: Edit for anyone with task access, Delete for managers. */
export function TaskActions({
  task,
  members,
  canDelete,
}: {
  task: Task;
  members: ProjectMemberSummary[];
  canDelete: boolean;
}) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${task.title}`}
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Pencil className="text-muted-foreground" />
            Edit task
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 />
                Delete task
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTaskDialog
        task={task}
        members={members}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {canDelete && (
        <DeleteTaskDialog
          task={task}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}

function EditTaskDialog({
  task,
  members,
  open,
  onOpenChange,
}: {
  task: Task;
  members: ProjectMemberSummary[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            Update the details, status, assignee or due date.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so it always starts from the saved task. */}
        <EditTaskForm
          task={task}
          members={members}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditTaskForm({
  task,
  members,
  onDone,
}: {
  task: Task;
  members: ProjectMemberSummary[];
  onDone: () => void;
}) {
  const updateTask = useUpdateTask();

  const initialValues: TaskFormValues = {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId,
    // Due dates are stored as midnight UTC, so the date part is the day.
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
  };

  const handleSubmit = (values: TaskFormValues) => {
    // Send only what changed. `null` clears the assignee or the due date.
    const input: UpdateTaskInput = {};

    if (values.title !== initialValues.title) input.title = values.title;
    if (values.description !== initialValues.description) {
      input.description = values.description;
    }
    if (values.status !== initialValues.status) input.status = values.status;
    if (values.priority !== initialValues.priority) {
      input.priority = values.priority;
    }
    if (values.assigneeId !== initialValues.assigneeId) {
      input.assigneeId = values.assigneeId;
    }
    if (values.dueDate !== initialValues.dueDate) {
      input.dueDate = values.dueDate || null;
    }

    if (Object.keys(input).length === 0) {
      onDone();
      return;
    }

    updateTask.mutate({ taskId: task.id, input }, { onSuccess: onDone });
  };

  return (
    <TaskForm
      initialValues={initialValues}
      members={members}
      currentAssignee={task.assignee}
      submitLabel="Save changes"
      pendingLabel="Saving…"
      isPending={updateTask.isPending}
      errorMessage={
        updateTask.isError
          ? getTaskErrorMessage(updateTask.error, "Couldn't update task.")
          : null
      }
      onSubmit={handleSubmit}
    />
  );
}

function DeleteTaskDialog({
  task,
  open,
  onOpenChange,
}: {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteTask = useDeleteTask();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium break-words text-foreground">
              {task.title}
            </span>
            ? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deleteTask.isError && (
          <p role="alert" className="text-[13px] text-destructive">
            {getTaskErrorMessage(deleteTask.error, "Couldn't delete task.")}
          </p>
        )}
        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={deleteTask.isPending} />}
          >
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            disabled={deleteTask.isPending}
            onClick={() =>
              deleteTask.mutate(
                { taskId: task.id, projectId: task.projectId },
                { onSuccess: () => onOpenChange(false) }
              )
            }
          >
            {deleteTask.isPending ? "Deleting…" : "Delete task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
