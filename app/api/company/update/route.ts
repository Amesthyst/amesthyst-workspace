import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const body = await req.json();

  const { employeeId, jobTitle } = body;

  if (!employeeId) {
    return NextResponse.json(
      { error: "Missing employeeId" },
      { status: 400 }
    );
  }

  const updated = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      jobTitle,
    },
  });

  return NextResponse.json(updated);
}