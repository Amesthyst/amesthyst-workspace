import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const { name, industry, userId, email } = body;

  if (!name || !userId) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const company = await prisma.company.create({
    data: {
      name,
      industry,
    },
  });

  // assign role (you already seeded roles earlier)
  const role = await prisma.role.findFirst({
    where: { name: "COMPANY_ADMIN" },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      companyId: company.id,
      roleId: role?.id,
    },
  });

  return NextResponse.json({ success: true });
}