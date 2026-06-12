import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function GET() {
  const user = await validateHRAccess();

  if (!user?.companyId) {
    return NextResponse.json([]);
  }

  const employees = await prisma.employee.findMany({
    where: {
      companyId: user.companyId,
    },
    include: {
      user: true,
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });

  return NextResponse.json(employees);
}