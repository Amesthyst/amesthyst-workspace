import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function GET() {
  try {
    const user = await validateHRAccess();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const employee = await prisma.employee.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!employee) {
      return NextResponse.json([]);
    }

    const notifications = await prisma.notification.findMany({
      where: {
        employeeId: employee.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}