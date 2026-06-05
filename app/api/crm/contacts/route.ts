import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json([]);
  }

  const contacts = await prisma.contact.findMany({
    where: { companyId },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(contacts);
}