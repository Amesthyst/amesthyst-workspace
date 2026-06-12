"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task, onSelect }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="bg-white border rounded p-3 mb-2 cursor-pointer hover:shadow"
    >
      <h3 className="font-semibold">{task.title}</h3>

      <p className="text-xs text-gray-500">
        {task.description}
      </p>

      <div className="text-xs mt-2">
        Priority: {task.priority || "MEDIUM"}
      </div>
    </div>
  );
}