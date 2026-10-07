"use client";

import {
  DEFAULT_TASK_FORM_VALUES,
  TaskForm,
  getTaskErrorMessage,
  type TaskFormValues,
} from "@/components/project/task-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProjectDetails } from "@/lib/api/projects";
import { useCreateTask } from "@/lib/hooks/use-tasks";

type DialogProject = Pick<ProjectDetails, "id" | "name" | "members">;

interface CreateTaskDialogProps {
  project: DialogProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({
  project,
  open,
  onOpenChange,
}: CreateTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>
            Add a task to{" "}
            <span className="font-medium text-foreground">{project.name}</span>.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the form resets each time. */}
        <CreateTaskForm project={project} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CreateTaskForm({
  project,
  onDone,
}: {
  project: DialogProject;
  onDone: () => void;
}) {
  const createTask = useCreateTask();

  const handleSubmit = (values: TaskFormValues) => {
    createTask.mutate(
      {
        projectId: project.id,
        input: {
          title: values.title,
          status: values.status,
          priority: values.priority,
          ...(values.description ? { description: values.description } : {}),
          ...(values.assigneeId ? { assigneeId: values.assigneeId } : {}),
          ...(values.dueDate ? { dueDate: values.dueDate } : {}),
        },
      },
      { onSuccess: onDone }
    );
  };

  return (
    <TaskForm
      initialValues={DEFAULT_TASK_FORM_VALUES}
      members={project.members}
      submitLabel="Create task"
      pendingLabel="Creating…"
      isPending={createTask.isPending}
      errorMessage={
        createTask.isError
          ? getTaskErrorMessage(createTask.error, "Couldn't create task.")
          : null
      }
      onSubmit={handleSubmit}
    />
  );
}
