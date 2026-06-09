import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function GET(req: Request) {
  const authUser = await validateHRAccess();

  if (!authUser) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json(
      { error: "companyId required" },
      { status: 400 }
    );
  }

  const [totalEmployees, activeEmployees, departments, pendingLeaves] =
    await Promise.all([
      prisma.employee.count({ where: { companyId } }),

      prisma.employee.count({
        where: { companyId, status: "ACTIVE" },
      }),

      prisma.department.count({
        where: { companyId },
      }),

      prisma.leaveRequest.count({
        where: {
          employee: { companyId },
          status: "PENDING",
        },
      }),
    ]);

  return NextResponse.json({
    totalEmployees,
    activeEmployees,
    departments,
    pendingLeaves,
  });
}