import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

  const companyId =
    searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json([]);
  }

  const employees =
    await prisma.employee.findMany({
      where: {
        companyId,
      },
      include: {
        user: true,
        department: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

  return NextResponse.json(employees);
}

export async function POST(req: Request) {
  const authUser = await validateHRAccess();

  if (!authUser) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await req.json();

  const employee =
    await prisma.employee.create({
      data: {
        companyId: body.companyId,
        userId: body.userId,
        departmentId:
          body.departmentId ?? null,
        jobTitle:
          body.jobTitle ?? null,
        hireDate:
          body.hireDate
            ? new Date(body.hireDate)
            : null,
        status: "ACTIVE",
      },
    });

  return NextResponse.json(employee);
}