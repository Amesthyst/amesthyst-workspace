import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const user = await validateHRAccess();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notification =
      await prisma.notification.findUnique({
        where: { id },
      });

    if (!notification) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "PATCH NOTIFICATION ERROR",
      error
    );

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}