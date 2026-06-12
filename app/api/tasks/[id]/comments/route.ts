import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const user =
      await validateHRAccess();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await req.json();

    if (
      !body.content ||
      !body.content.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Comment content is required",
        },
        {
          status: 400,
        }
      );
    }

    const task =
      await prisma.task.findUnique({
        where: {
          id,
        },

        include: {
          project: true,
        },
      });

    if (!task) {
      return NextResponse.json(
        {
          error:
            "Task not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      task.project.companyId !==
      user.companyId
    ) {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const comment =
      await prisma.taskComment.create({
        data: {
          taskId: id,
          userId: user.id,
          content:
            body.content.trim(),
        },

        include: {
          user: true,
        },
      });

    const employee =
      await prisma.employee.findUnique({
        where: {
          userId: user.id,
        },
      });

    if (employee) {
      await prisma.taskActivity.create({
        data: {
          taskId: id,

          employeeId:
            employee.id,

          action:
            "COMMENT_ADDED",

          message:
            "Added a comment",

          metadata: {
            commentId:
              comment.id,
          },
        },
      });
    }

    if (
      user.companyId &&
      user.id
    ) {
      try {
        await prisma.auditLog.create({
          data: {
            companyId:
              user.companyId,

            userId:
              user.id,

            action:
              "TASK_COMMENT_CREATED",

            entity:
              "TASK_COMMENT",

            entityId:
              comment.id,
          },
        });
      } catch (auditError) {
        console.error(
          "AUDIT LOG ERROR",
          auditError
        );
      }
    }

    return NextResponse.json(
      comment
    );
  } catch (error) {
    console.error(
      "CREATE COMMENT ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create comment",
      },
      {
        status: 500,
      }
    );
  }
}