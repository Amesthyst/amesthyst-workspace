"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import KanbanBoard from "./components/KanbanBoard";
import TaskDetailPanel from "./components/TaskDetailPanel";


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

  createdAt?: string;

  updatedAt?: string;
};

type Project = {
  id: string;

  name: string;

  description?: string | null;

  status: string;

  tasks: Task[];
};


function calculateProgress(
  tasks: Task[]
): number {
  if (!tasks.length) return 0;

  const doneTasks = tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  return Math.round(
    (doneTasks / tasks.length) * 100
  );
}

export default function ProjectPage() {
  const params = useParams<{
    id: string;
  }>();

  const projectId = params?.id;

  const [project, setProject] =
    useState<Project | null>(null);

  const [selectedTaskId, setSelectedTaskId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


    async function createTask(payload: {
        title: string;
        status: string;
      }) {
        if (!project) return;
      
        const tempId = `temp-${Date.now()}`;
      
        setProject({
          ...project,
          tasks: [
            ...project.tasks,
            {
              id: tempId,
              title: payload.title,
              status: payload.status as TaskStatus,
            },
          ],
        });
      
        try {
          const res = await fetch("/api/tasks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              projectId: project.id,
              title: payload.title,
              status: payload.status,
            }),
          });
      
          if (!res.ok) {
            throw new Error("Failed to create task");
          }
      
          await loadProject(true);
        } catch (err) {
          console.error(err);
          alert("Failed to create task");
          await loadProject(true);
        }
      }

  async function loadProject(
    silent = false
  ) {
    if (!projectId) return;

    try {
      if (!silent) {
        setLoading(true);
      }

      setRefreshing(true);
      setError(null);

      const res = await fetch(
        `/api/projects/${projectId}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load project"
        );
      }

      const data = await res.json();

      setProject(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load project"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const selectedTask = useMemo(() => {
    if (!project) return null;

    return (
      project.tasks.find(
        (task) =>
          task.id === selectedTaskId
      ) ?? null
    );
  }, [project, selectedTaskId]);


  async function moveTask(
    taskId: string,
    status: TaskStatus
  ) {
    if (!project) return;

    const previousProject = project;

    setProject({
      ...project,
      tasks: project.tasks.map(
        (task) =>
          task.id === taskId
            ? {
                ...task,
                status,
              }
            : task
      ),
    });

    try {
      const res = await fetch(
        `/api/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to update task"
        );
      }

      await loadProject(true);
    } catch (err) {
      console.error(err);

      setProject(previousProject);

      alert(
        "Failed to move task"
      );
    }
  }

  async function quickUpdate(
    taskId: string,
    payload: Partial<Task>
  ) {
    if (!project) return;

    const previousProject = project;

    setProject({
      ...project,
      tasks: project.tasks.map(
        (task) =>
          task.id === taskId
            ? {
                ...task,
                ...payload,
              }
            : task
      ),
    });

    try {
      const res = await fetch(
        `/api/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to update task"
        );
      }

      await loadProject(true);
    } catch (err) {
      console.error(err);

      setProject(previousProject);

      alert(
        "Failed to update task"
      );
    }
  }

  async function refreshProject() {
    await loadProject(true);
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-500">
          Loading project...
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="text-red-500">
          {error ??
            "Project not found"}
        </div>
      </div>
    );
  }

  const progress =
    calculateProgress(
      project.tasks
    );

  const todoCount =
    project.tasks.filter(
      (t) => t.status === "TODO"
    ).length;

  const progressCount =
    project.tasks.filter(
      (t) =>
        t.status ===
        "IN_PROGRESS"
    ).length;

  const doneCount =
    project.tasks.filter(
      (t) => t.status === "DONE"
    ).length;

  return (
    <div className="grid grid-cols-12 gap-4 p-4 min-h-screen bg-gray-50">

      <div className="col-span-3">

        <div className="bg-white border rounded-lg p-4 space-y-4">

          <div>

            <h1 className="text-2xl font-bold">
              {project.name}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {project.description ||
                "No description"}
            </p>

          </div>

          <div className="space-y-2 text-sm">

            <div>
              Status:
              <span className="ml-2 font-semibold">
                {project.status}
              </span>
            </div>

            <div>
              Tasks:
              <span className="ml-2 font-semibold">
                {
                  project.tasks
                    .length
                }
              </span>
            </div>

            <div>
              Progress:
              <span className="ml-2 font-semibold text-green-600">
                {progress}%
              </span>
            </div>

          </div>

          <div className="w-full bg-gray-200 rounded h-3">

            <div
              className="bg-green-500 h-3 rounded transition-all"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <div className="grid grid-cols-3 gap-2 text-center">

            <div className="bg-gray-100 rounded p-2">
              <div className="font-bold">
                {todoCount}
              </div>
              <div className="text-xs">
                TODO
              </div>
            </div>

            <div className="bg-gray-100 rounded p-2">
              <div className="font-bold">
                {progressCount}
              </div>
              <div className="text-xs">
                DOING
              </div>
            </div>

            <div className="bg-gray-100 rounded p-2">
              <div className="font-bold">
                {doneCount}
              </div>
              <div className="text-xs">
                DONE
              </div>
            </div>

          </div>

          <button
            onClick={
              refreshProject
            }
            disabled={
              refreshing
            }
            className="w-full border rounded p-2 hover:bg-gray-100"
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

      </div>

      <div className="col-span-6">

      <KanbanBoard
        tasks={project.tasks}
        onMove={moveTask}
        onSelectTask={(task: Task) =>
            setSelectedTaskId(task.id)
        }
        onQuickUpdate={quickUpdate}
        onCreateTask={createTask}
        />

      </div>

      <div className="col-span-3">

        <TaskDetailPanel
          task={selectedTask}
          onQuickUpdate={
            quickUpdate
          }
        />

      </div>

    </div>
  );
}