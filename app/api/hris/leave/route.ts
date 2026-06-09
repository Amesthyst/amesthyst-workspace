import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

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

  const leaves = await prisma.leaveRequest.findMany({
    where: {
      employee: {
        companyId,
      },
    },
    include: {
      employee: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return NextResponse.json(leaves);
}

/* CREATE LEAVE REQUEST */
export async function POST(req: Request) {
  const authUser = await validateHRAccess();

  if (!authUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId: body.employeeId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      reason: body.reason,
      status: "PENDING",
    },
  });

  return NextResponse.json(leave);
}

/* UPDATE STATUS (APPROVE / REJECT) */
export async function PATCH(req: Request) {
  const authUser = await validateHRAccess();

  if (!authUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { leaveId, status } = body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status },
  });

  return NextResponse.json(updated);
}