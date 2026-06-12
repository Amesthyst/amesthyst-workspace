import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

/* =========================
   CREATE TASK (FIXED)
========================= */

export async function POST(req: Request) {
  try {
    const user = await validateHRAccess();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    /* =========================
       VALIDATION
    ========================= */

    if (!body.projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    if (!body.title || body.title.trim() === "") {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    /* =========================
       CHECK PROJECT OWNERSHIP
    ========================= */

    const project = await prisma.project.findUnique({
      where: { id: body.projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.companyId !== user.companyId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    /* =========================
       CREATE TASK
    ========================= */

    const task = await prisma.task.create({
      data: {
        projectId: body.projectId,
        title: body.title,
        description: body.description ?? null,
        status: body.status ?? "TODO",
        priority: body.priority ?? "MEDIUM",
        assigneeId: body.assigneeId ?? null,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}