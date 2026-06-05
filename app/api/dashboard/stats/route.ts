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

  const [
    leads,
    employees,
    projects,
    wonDeals,
  ] = await Promise.all([
    prisma.lead.count({
      where: { companyId },
    }),

    prisma.employee.count({
      where: { companyId },
    }),

    prisma.project.count({
      where: { companyId },
    }),

    prisma.lead.count({
      where: {
        companyId,
        status: "WON",
      },
    }),
  ]);

  return NextResponse.json({
    leads,
    employees,
    projects,
    wonDeals,
  });
}