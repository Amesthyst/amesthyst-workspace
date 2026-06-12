"use client";

import { useState } from "react";

type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
};

const COLUMNS = ["TODO", "IN_PROGRESS", "DONE"];

export default function KanbanBoard({
  tasks,
  onMove,
  onSelectTask,
  onCreateTask,
}: any) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [creatingColumn, setCreatingColumn] = useState<string | null>(null);

  function onDragStart(task: Task) {
    setDraggedTask(task);
  }

  function onDrop(status: string) {
    if (!draggedTask) return;

    onMove(draggedTask.id, status);
    setDraggedTask(null);
  }

  async function handleCreate(column: string) {
    if (!newTaskTitle.trim()) return;

    await onCreateTask({
      title: newTaskTitle,
      status: column,
    });

    setNewTaskTitle("");
    setCreatingColumn(null);
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {COLUMNS.map((col) => (
        <div
          key={col}
          className="bg-gray-100 p-3 rounded min-h-[500px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(col)}
        >
          {/* HEADER */}
          <h2 className="font-bold mb-3">{col}</h2>

          {/* TASK LIST */}
          {tasks
            .filter((t: Task) => t.status === col)
            .map((task: Task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => onDragStart(task)}
                onClick={() => onSelectTask(task)}
                className="p-2 bg-white mb-2 rounded shadow cursor-pointer"
              >
                {task.title}
              </div>
            ))}

          {/* CREATE TASK INPUT */}
          {creatingColumn === col ? (
            <div className="mt-3 space-y-2">
              <input
                className="w-full p-2 border rounded"
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) =>
                  setNewTaskTitle(e.target.value)
                }
              />

              <div className="flex gap-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => handleCreate(col)}
                >
                  Add
                </button>

                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => setCreatingColumn(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="mt-3 text-sm text-blue-600"
              onClick={() => setCreatingColumn(col)}
            >
              + Add Task
            </button>
          )}
        </div>
      ))}
    </div>
  );
}