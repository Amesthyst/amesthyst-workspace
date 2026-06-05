import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const leadId = searchParams.get("leadId");

  if (!leadId) {
    return NextResponse.json([]);
  }

  const activities =
    await prisma.activity.findMany({
      where: {
        leadId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  const body = await req.json();

  const activity =
    await prisma.activity.create({
      data: {
        leadId: body.leadId,
        type: body.type,
        description: body.description,
      },
    });

  return NextResponse.json(activity);
}