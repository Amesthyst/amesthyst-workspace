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

  const leads = await prisma.lead.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leads);
}

// CREATE lead
export async function POST(req: Request) {
  const body = await req.json();

  const { companyId, name, email, phone, status, source } = body;

  if (!companyId || !name) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.create({
    data: {
      companyId,
      name,
      email,
      phone,
      status: status ?? "NEW",
      source,
    },
  });

  return NextResponse.json(lead);
}