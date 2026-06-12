import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

const allowedStatus = [
  "ACTIVE",
  "RESIGNED",
  "TERMINATED",
  "ON_LEAVE",
] as const;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await validateHRAccess();

  if (!authUser) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: true,
      department: true,
      attendance: {
        orderBy: { clockIn: "desc" },
        take: 30,
      },
      leaveRequests: {
        orderBy: { startDate: "desc" },
      },
      payroll: {
        where: {
          status: "PAID",
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!employee) {
    return NextResponse.json(
      { error: "Employee not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(employee);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await validateHRAccess();

  if (!authUser) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json();

  if (body.status && !allowedStatus.includes(body.status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee) {
    return NextResponse.json(
      { error: "Employee not found" },
      { status: 404 }
    );
  }

  await prisma.employee.update({
    where: { id },
    data: {
      jobTitle: body.jobTitle,
      phone: body.phone,
      address: body.address,
      employeeNumber: body.employeeNumber,
      status: body.status,
      hireDate: body.hireDate
        ? new Date(body.hireDate)
        : undefined,
      birthDate: body.birthDate
        ? new Date(body.birthDate)
        : undefined,
    },
  });

  await prisma.user.update({
    where: { id: employee.userId },
    data: {
      name: body.name,
    },
  });

  return NextResponse.json({ success: true });
}