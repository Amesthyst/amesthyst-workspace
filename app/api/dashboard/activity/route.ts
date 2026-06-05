import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json(
      { error: "Missing companyId" },
      { status: 400 }
    );
  }

  const activities = await prisma.activity.findMany({
    where: {
      lead: {
        companyId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return NextResponse.json(activities);
}