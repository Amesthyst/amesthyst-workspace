"use client";

import { useEffect, useState } from "react";

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE";

type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

type Task = {
  id: string;

  title: string;

  description?: string | null;

  status: TaskStatus;

  priority?: TaskPriority;

  assigneeId?: string | null;

  dueDate?: string | null;

  assignee?: {
    id: string;
    user?: {
      name?: string | null;
      email?: string | null;
    };
  } | null;
};

type Props = {
  task: Task | null;

  onQuickUpdate: (
    taskId: string,
    payload: Partial<Task>
  ) => Promise<void> | void;
};

export default function TaskDetailPanel({
  task,
  onQuickUpdate,
}: Props) {
  const [form, setForm] =
    useState<Partial<Task>>({});

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!task) {
      setForm({});
      return;
    }

    setForm({
      title: task.title,
      description:
        task.description ?? "",
      status: task.status,
      priority:
        task.priority ?? "MEDIUM",
      dueDate:
        task.dueDate ?? "",
    });
  }, [task]);

  async function saveChanges() {
    if (!task) return;

    try {
      setSaving(true);

      await onQuickUpdate(
        task.id,
        {
          title:
            form.title,
          description:
            form.description,
          status:
            form.status as TaskStatus,
          priority:
            form.priority as TaskPriority,
          dueDate:
            form.dueDate,
        }
      );
    } finally {
      setSaving(false);
    }
  }

  if (!task) {
    return (
      <div className="bg-white border rounded-lg p-6">

        <h2 className="font-semibold mb-2">
          Task Detail
        </h2>

        <p className="text-sm text-gray-500">
          Select a task from the
          board.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg h-full overflow-auto">

      <div className="border-b p-4">

        <h2 className="text-lg font-bold">
          Task Inspector
        </h2>

        <p className="text-xs text-gray-500 mt-1">
          Manage task details and
          workflow.
        </p>

      </div>

      <div className="p-4 space-y-5">

        <div>

          <label className="block text-sm font-medium mb-1">
            Title
          </label>

          <input
            className="w-full border rounded p-2"
            value={
              form.title ?? ""
            }
            onChange={(e) =>
              setForm({
                ...form,
                title:
                  e.target.value,
              })
            }
          />

        </div>

        <div>

          <label className="block text-sm font-medium mb-1">
            Description
          </label>

          <textarea
            rows={5}
            className="w-full border rounded p-2 resize-none"
            value={
              form.description ??
              ""
            }
            onChange={(e) =>
              setForm({
                ...form,
                description:
                  e.target.value,
              })
            }
          />

        </div>

        <div>

          <label className="block text-sm font-medium mb-1">
            Status
          </label>

          <select
            className="w-full border rounded p-2"
            value={
              form.status ??
              "TODO"
            }
            onChange={(e) =>
              setForm({
                ...form,
                status:
                  e.target
                    .value as TaskStatus,
              })
            }
          >
            <option value="TODO">
              TODO
            </option>

            <option value="IN_PROGRESS">
              IN PROGRESS
            </option>

            <option value="DONE">
              DONE
            </option>

          </select>

        </div>

        <div>

          <label className="block text-sm font-medium mb-1">
            Priority
          </label>

          <select
            className="w-full border rounded p-2"
            value={
              form.priority ??
              "MEDIUM"
            }
            onChange={(e) =>
              setForm({
                ...form,
                priority:
                  e.target
                    .value as TaskPriority,
              })
            }
          >
            <option value="LOW">
              LOW
            </option>

            <option value="MEDIUM">
              MEDIUM
            </option>

            <option value="HIGH">
              HIGH
            </option>

          </select>

        </div>

        <div>

          <label className="block text-sm font-medium mb-1">
            Due Date
          </label>

          <input
            type="date"
            className="w-full border rounded p-2"
            value={
              form.dueDate
                ? String(
                    form.dueDate
                  ).slice(
                    0,
                    10
                  )
                : ""
            }
            onChange={(e) =>
              setForm({
                ...form,
                dueDate:
                  e.target.value,
              })
            }
          />

        </div>

        <div>

          <label className="block text-sm font-medium mb-1">
            Assignee
          </label>

          <div className="border rounded p-3 bg-gray-50">

            {task.assignee ? (
              <>
                <div className="font-medium">
                  {
                    task.assignee
                      .user?.name
                  }
                </div>

                <div className="text-xs text-gray-500">
                  {
                    task.assignee
                      .user?.email
                  }
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">
                Unassigned
              </div>
            )}

          </div>

        </div>


        <div>

          <label className="block text-sm font-medium mb-2">
            Quick Actions
          </label>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={() =>
                onQuickUpdate(
                  task.id,
                  {
                    status:
                      "IN_PROGRESS",
                  }
                )
              }
              className="px-3 py-2 border rounded hover:bg-gray-100"
            >
              Start Task
            </button>

            <button
              onClick={() =>
                onQuickUpdate(
                  task.id,
                  {
                    status:
                      "DONE",
                  }
                )
              }
              className="px-3 py-2 border rounded hover:bg-gray-100"
            >
              Mark Done
            </button>

            <button
              onClick={() =>
                onQuickUpdate(
                  task.id,
                  {
                    priority:
                      "HIGH",
                  }
                )
              }
              className="px-3 py-2 border rounded hover:bg-gray-100"
            >
              High Priority
            </button>

          </div>

        </div>


        <div className="border-t pt-4 text-xs text-gray-500 space-y-1">

          <div>
            Task ID:
          </div>

          <div className="break-all">
            {task.id}
          </div>

        </div>


        <button
          onClick={saveChanges}
          disabled={saving}
          className="w-full bg-black text-white rounded p-3 hover:opacity-90 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>

      </div>

    </div>
  );
}