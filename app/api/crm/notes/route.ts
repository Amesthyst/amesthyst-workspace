import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const leadId = searchParams.get("leadId");

  if (!leadId) {
    return NextResponse.json(
      { error: "Missing leadId" },
      { status: 400 }
    );
  }


  const notes =
    await prisma.note.findMany({
      where: {
        leadId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const body = await req.json();

  const note =
    await prisma.note.create({
      data: {
        leadId: body.leadId,
        content: body.content,
      },
    });

  return NextResponse.json(note);
}