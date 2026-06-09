import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function GET() {
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
      },

      include: {
        user: true,

        department: {
          select: {
            id: true,
            name: true,
          },
        },

        payroll: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },

      orderBy: {
        employeeNumber: "asc",
      },
    });

  return NextResponse.json(employees);
}