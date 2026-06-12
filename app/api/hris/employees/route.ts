import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

async function generateEmployeeNumber(companyId: string) {
  const year = new Date().getFullYear();

  return await prisma.$transaction(async (tx) => {
    let counter = await tx.employeeNumberCounter.findUnique({
      where: {
        companyId_year: {
          companyId,
          year,
        },
      },
    });

    if (!counter) {
      counter = await tx.employeeNumberCounter.create({
        data: {
          companyId,
          year,
          current: 0,
        },
      });
    }
    const updated = await tx.employeeNumberCounter.update({
      where: {
        companyId_year: {
          companyId,
          year,
        },
      },
      data: {
        current: {
          increment: 1,
        },
      },
    });

    const number = updated.current;

    return `EMP-${year}-${String(number).padStart(4, "0")}`;
  });
}

export async function GET(req: Request) {
  const authUser = await validateHRAccess();

  if (!authUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json([]);
  }

  const employees = await prisma.employee.findMany({
    where: { companyId },
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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  if (!body.companyId || !body.userId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const employeeNumber = await generateEmployeeNumber(
      body.companyId
    );

    const employee = await prisma.employee.create({
      data: {
        companyId: body.companyId,
        userId: body.userId,
        departmentId: body.departmentId ?? null,

        jobTitle: body.jobTitle ?? null,

        hireDate: body.hireDate
          ? new Date(body.hireDate)
          : null,

        status: "ACTIVE",

        employeeNumber,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}