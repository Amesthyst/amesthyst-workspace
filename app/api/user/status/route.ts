import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: body.userId },
  });

  return NextResponse.json({
    needsOnboarding: !user?.companyId,
  });
}