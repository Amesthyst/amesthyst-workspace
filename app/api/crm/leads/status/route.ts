import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const body = await req.json();

  const { leadId, status } = body;

  if (!leadId || !status) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: { status },
  });

  return NextResponse.json(updated);
}