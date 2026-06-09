import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function GET() {
  try {
    const authUser = await validateHRAccess();

    if (!authUser || !authUser.companyId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const employees =
      await prisma.employee.findMany({
        where: {
          companyId: authUser.companyId,
          departmentId: null,
        },

        include: {
          user: true,

          payroll: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(employees);
  } catch (error) {
    console.error(
      "UNASSIGNED_EMPLOYEES_ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load unassigned employees",
      },
      {
        status: 500,
      }
    );
  }
}