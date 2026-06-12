import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

/* ==================================================
   GET PROJECT
================================================== */

export async function GET(
  req: Request,
  {
    params,
  }: {
    params:
      | { id: string }
      | Promise<{ id: string }>;
  }
) {
  try {
    const resolvedParams =
      await Promise.resolve(params);

    const id = resolvedParams.id;

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

    const project =
      await prisma.project.findUnique({
        where: {
          id,
        },

        include: {
          tasks: {
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
                  createdAt:
                    "desc",
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
                  createdAt:
                    "desc",
                },
              },

              taskfile: true,
            },
          },

          activities: {
            include: {
              employee: {
                include: {
                  user: true,
                },
              },
            },

            orderBy: {
              createdAt:
                "desc",
            },
          },

          projectfile: true,
        },
      });

    if (!project) {
      return NextResponse.json(
        {
          error:
            "Project not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      project
    );
  } catch (error) {
    console.error(
      "GET PROJECT ERROR",
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
   PATCH PROJECT
================================================== */

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params:
      | Promise<{ id: string }>;
  }
) {
  try {
    const { id } =
      await params;

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

    const existing =
      await prisma.project.findUnique(
        {
          where: { id },
        }
      );

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Project not found",
        },
        {
          status: 404,
        }
      );
    }

    const project =
      await prisma.project.update({
        where: {
          id,
        },

        data: {
          ...(body.name !==
            undefined && {
            name: body.name,
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

          ...(body.startDate && {
            startDate:
              new Date(
                body.startDate
              ),
          }),

          ...(body.endDate && {
            endDate:
              new Date(
                body.endDate
              ),
          }),
        },
      });

    /* ==========================
       AUDIT LOG
    ========================== */

    if (
      user.companyId &&
      user.id
    ) {
      await prisma.auditLog.create(
        {
          data: {
            companyId:
              user.companyId,

            userId:
              user.id,

            action:
              "PROJECT_UPDATED",

            entity:
              "PROJECT",

            entityId:
              project.id,
          },
        }
      );
    }

    return NextResponse.json(
      project
    );
  } catch (error) {
    console.error(
      "PATCH PROJECT ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update project",
      },
      {
        status: 500,
      }
    );
  }
}

/* ==================================================
   DELETE PROJECT
================================================== */

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params:
      | Promise<{ id: string }>;
  }
) {
  try {
    const { id } =
      await params;

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

    const existing =
      await prisma.project.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Project not found",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================
       DELETE CHILD DATA FIRST
       (Required by current schema)
    ===================================== */

    const tasks =
      await prisma.task.findMany({
        where: {
          projectId: id,
        },

        select: {
          id: true,
        },
      });

    const taskIds =
      tasks.map(
        (task) => task.id
      );

    if (
      taskIds.length > 0
    ) {
      await prisma.taskComment.deleteMany(
        {
          where: {
            taskId: {
              in: taskIds,
            },
          },
        }
      );

      await prisma.taskActivity.deleteMany(
        {
          where: {
            taskId: {
              in: taskIds,
            },
          },
        }
      );

      await prisma.taskFile.deleteMany(
        {
          where: {
            taskId: {
              in: taskIds,
            },
          },
        }
      );

      await prisma.task.deleteMany(
        {
          where: {
            id: {
              in: taskIds,
            },
          },
        }
      );
    }

    await prisma.projectActivity.deleteMany(
      {
        where: {
          projectId: id,
        },
      }
    );

    await prisma.projectFile.deleteMany(
      {
        where: {
          projectId: id,
        },
      }
    );

    await prisma.project.delete({
      where: {
        id,
      },
    });

    /* ==========================
       AUDIT LOG
    ========================== */

    if (
      user.companyId &&
      user.id
    ) {
      await prisma.auditLog.create(
        {
          data: {
            companyId:
              user.companyId,

            userId:
              user.id,

            action:
              "PROJECT_DELETED",

            entity:
              "PROJECT",

            entityId: id,
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE PROJECT ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete project",
      },
      {
        status: 500,
      }
    );
  }
}