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

  const users =
    await prisma.user.findMany({
      where: {
        companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

  return NextResponse.json(users);
}