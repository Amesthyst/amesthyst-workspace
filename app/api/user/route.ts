import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import { validateCompanyAccess } from "@/lib/auth/validateCompanyAccess";

export async function GET() {
  const authUser = await validateCompanyAccess();

  if (!authUser) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const users = await prisma.user.findMany({
    where: {
      companyId: authUser.companyId,
    },
    include: {
      role: true,
      employee: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(users);
}