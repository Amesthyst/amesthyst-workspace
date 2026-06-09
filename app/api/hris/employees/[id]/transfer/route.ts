import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await validateHRAccess();

  if (!authUser || !authUser.companyId) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await params;

  const body = await req.json();

  const employee = await prisma.employee.update({
    where: {
      id,
    },
    data: {
      departmentId: body.departmentId,
    },
  });

  return NextResponse.json(employee);
}