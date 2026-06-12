import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

/* ==================================================
   GET TASK
================================================== */

export async function GET(
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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const task =
      await prisma.task.findUnique({
        where: { id },

        include: {
          assignee: {
            include: {
              user: true,
            },
          },

          comments: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },

          taskactivity: {
            include: {
              employee: {
                include: {
                  user: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },

          taskfile: true,
        },
      });

    if (!task) {
      return NextResponse.json(
        {
          error: "Task not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error(
      "GET TASK ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

/* ==================================================
   PATCH TASK
================================================== */

export async function PATCH(
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

    const existingTask =
      await prisma.task.findUnique({
        where: { id },
      });

    if (!existingTask) {
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

    /* ==========================
       VALIDATE ASSIGNEE
    ========================== */

    if (
      body.assigneeId
    ) {
      const employee =
        await prisma.employee.findUnique(
          {
            where: {
              id:
                body.assigneeId,
            },
          }
        );

      if (!employee) {
        return NextResponse.json(
          {
            error:
              "Assignee not found",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* ==========================
       UPDATE TASK
    ========================== */

    const updatedTask =
      await prisma.task.update({
        where: { id },

        data: {
          ...(body.title !==
            undefined && {
            title:
              body.title,
          }),

          ...(body.description !==
            undefined && {
            description:
              body.description,
          }),

          ...(body.status !==
            undefined && {
            status:
              body.status,
          }),

          ...(body.priority !==
            undefined && {
            priority:
              body.priority,
          }),

          ...(body.assigneeId !==
            undefined && {
            assigneeId:
              body.assigneeId,
          }),

          ...(body.dueDate !==
            undefined && {
            dueDate:
              body.dueDate
                ? new Date(
                    body.dueDate
                  )
                : null,
          }),
        },

        include: {
          assignee: {
            include: {
              user: true,
            },
          },
        },
      });

    /* ==========================
       TASK ACTIVITY
    ========================== */
    const employee =
    await prisma.employee.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (employee) {
      await prisma.taskActivity.create(
        {
          data: {
            taskId:
              updatedTask.id,

            employeeId:
              employee.id,

            action:
              "TASK_UPDATED",

            message:
              body.status
                ? `Status changed to ${body.status}`
                : "Task updated",

            metadata: body,
          },
        }
      );
    }

    /* ==========================
       AUDIT LOG
    ========================== */

    /* ==========================
   AUDIT LOG (IMPROVED)
========================== */

if (user.companyId) {
  try {
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "TASK_UPDATED",
        entity: "TASK",
        entityId: updatedTask.id,
      },
    });
  } catch (err) {
    console.error("AUDIT LOG ERROR:", err);
  }
}

    return NextResponse.json(
      updatedTask
    );
  } catch (error) {
    console.error(
      "PATCH TASK ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update task",
      },
      {
        status: 500,
      }
    );
  }
}

/* ==================================================
   DELETE TASK
================================================== */

export async function DELETE(
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

    /* ==========================
       COMPANY SECURITY
    ========================== */

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

    /* ==========================
       DELETE EVERYTHING
       INSIDE TRANSACTION
    ========================== */

    await prisma.$transaction([
      prisma.taskComment.deleteMany({
        where: {
          taskId: id,
        },
      }),

      prisma.taskActivity.deleteMany({
        where: {
          taskId: id,
        },
      }),

      prisma.taskFile.deleteMany({
        where: {
          taskId: id,
        },
      }),

      prisma.task.delete({
        where: {
          id,
        },
      }),
    ]);

 /* ==========================
   AUDIT LOG + NOTIFICATION
   (NON-BLOCKING)
========================== */

if (user.companyId && user.id) {
  try {
    // ==========================
    // AUDIT LOG
    // ==========================
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "TASK_DELETED",
        entity: "TASK",
        entityId: id,
      },
    });

    // ==========================
    // NOTIFICATION (ENTERPRISE)
    // ==========================

    // optional: find affected employees from task context
    const taskOwner = await prisma.task.findUnique({
      where: { id },
      select: {
        assigneeId: true,
        title: true,
      },
    });

    if (taskOwner?.assigneeId) {
      await prisma.notification.create({
        data: {
          companyId: user.companyId,
          employeeId: taskOwner.assigneeId,
          title: "Task Deleted",
          message: `Task "${taskOwner.title}" has been deleted`,
        },
      });
    }
  } catch (err) {
    console.error("AUDIT / NOTIFICATION ERROR", err);
    // non-blocking → jangan ganggu delete flow
  }
}

return NextResponse.json({
  success: true,
});
  } catch (error) {
    console.error(
      "DELETE TASK ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete task",
      },
      {
        status: 500,
      }
    );
  }
}