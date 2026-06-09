import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser =
    await validateHRAccess();

  if (!authUser) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { id: departmentId } =
    await params;

  const body = await req.json();

  const employeeId =
    body.employeeId;

  if (!employeeId) {
    return NextResponse.json(
      {
        error:
          "Employee ID required",
      },
      { status: 400 }
    );
  }

  const employee =
    await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
    });

  if (!employee) {
    return NextResponse.json(
      {
        error:
          "Employee not found",
      },
      { status: 404 }
    );
  }

  await prisma.employee.update({
    where: {
      id: employeeId,
    },
    data: {
      departmentId,
    },
  });

  return NextResponse.json({
    success: true,
    message:
      employee.departmentId
        ? "Employee transferred successfully"
        : "Employee assigned successfully",
  });
}