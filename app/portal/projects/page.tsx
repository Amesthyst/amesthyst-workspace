"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "COMPLETED"
  | "ON_HOLD";

  type Project = {
    id: string;
    name: string;
    description: string | null;
    status: string;
  
    tasks: {
      id: string;
      status: string;
    }[];
  };

  
  function getProjectProgress(
    tasks: {
      status: string;
    }[]
  ) {
    if (!tasks?.length) {
      return 0;
    }
  
    const doneTasks = tasks.filter(
      (task) =>
        task.status === "DONE"
    ).length;
  
    return Math.round(
      (doneTasks / tasks.length) * 100
    );
  }

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  async function loadProjects() {
    try {
      setLoading(true);

      const res = await fetch("/api/projects", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load projects");
      }

      const data = await res.json();

      const normalized = data.map((project: any) => ({
        ...project,
        tasks: project.tasks ?? [],
      }));

      setProjects(normalized);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function createProject() {
    try {
      if (!form.name.trim()) {
        alert("Project name is required");
        return;
      }

      setCreating(true);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to create project");
      }

      setForm({
        name: "",
        description: "",
      });

      await loadProjects();
    } catch (error) {
      console.error(error);
      alert("Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  async function updateProject(
    id: string,
    payload: Partial<Project>
  ) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update project");
      }

      setProjects((prev) =>
        prev.map((project) =>
          project.id === id
            ? {
                ...project,
                ...payload,
              }
            : project
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update project");
    }
  }

  async function deleteProject(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete project");
      }

      setProjects((prev) =>
        prev.filter((project) => project.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete project");
    }
  }

  const filteredProjects = projects.filter((project) =>
    project.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const stats = {
    total: projects.length,

    planning: projects.filter(
      (p) => p.status === "PLANNING"
    ).length,

    active: projects.filter(
      (p) => p.status === "ACTIVE"
    ).length,

    completed: projects.filter(
      (p) => p.status === "COMPLETED"
    ).length,
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Project Management
        </h1>

        <p className="text-muted-foreground">
          Manage projects and monitor progress
        </p>
      </div>


      <div className="grid md:grid-cols-4 gap-4">

        <Card className="p-4">
          <p>Total Projects</p>

          <h2 className="text-3xl font-bold">
            {stats.total}
          </h2>
        </Card>

        <Card className="p-4">
          <p>Planning</p>

          <h2 className="text-3xl font-bold text-yellow-600">
            {stats.planning}
          </h2>
        </Card>

        <Card className="p-4">
          <p>Active</p>

          <h2 className="text-3xl font-bold text-blue-600">
            {stats.active}
          </h2>
        </Card>

        <Card className="p-4">
          <p>Completed</p>

          <h2 className="text-3xl font-bold text-green-600">
            {stats.completed}
          </h2>
        </Card>

      </div>

      <Card className="p-4 space-y-3">

        <h2 className="font-semibold">
          Create New Project
        </h2>

        <Input
          placeholder="Project Name"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />

        <Input
          placeholder="Project Description"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
        />

        <Button
          disabled={creating}
          onClick={createProject}
        >
          {creating
            ? "Creating..."
            : "Create Project"}
        </Button>

      </Card>

      <Input
        placeholder="Search projects..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      {loading && (
        <Card className="p-6 text-center">
          Loading projects...
        </Card>
      )}

      {!loading &&
        filteredProjects.length === 0 && (
          <Card className="p-6 text-center">
            No projects found
          </Card>
        )}

      {!loading &&
        filteredProjects.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="p-5 space-y-4 cursor-pointer hover:shadow-lg transition"
                onClick={() =>
                  router.push(
                    `/portal/projects/${project.id}`
                  )
                }
              >

                <div>
                  <h2 className="font-bold text-lg">
                    {project.name}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {project.description ||
                      "No description"}
                  </p>
                </div>

                <div>

                  <label className="text-sm">
                    Status
                  </label>

                  <select
                    className="w-full border rounded p-2 mt-1"
                    value={project.status}
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                    onChange={(e) =>
                      updateProject(project.id, {
                        status:
                          e.target
                            .value as ProjectStatus,
                      })
                    }
                  >
                    <option value="PLANNING">
                      PLANNING
                    </option>

                    <option value="ACTIVE">
                      ACTIVE
                    </option>

                    <option value="COMPLETED">
                      COMPLETED
                    </option>

                    <option value="ON_HOLD">
                      ON HOLD
                    </option>
                  </select>

                </div>

                <div>

                  <div className="flex justify-between text-sm">
                    <span>Progress</span>

                    <span>
                      {getProjectProgress(project.tasks)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded h-3 mt-2">

                    <div
                      className="bg-green-500 h-3 rounded transition-all"
                      style={{
                        width: `${getProjectProgress(project.tasks)}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="flex justify-between items-center">

                  <div>
                    Tasks:
                    <span className="ml-2 font-bold">
                      {project.tasks.length ?? 0}
                    </span>
                  </div>

                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                  >
                    Delete
                  </Button>

                </div>

              </Card>
            ))}

          </div>
        )}
    </div>
  );
}