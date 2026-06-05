import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const companyId =
    searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json(
      { error: "Missing companyId" },
      { status: 400 }
    );
  }

  const leads = await prisma.lead.findMany({
    where: {
      companyId,
    },
  });

  const total = leads.length;

  const newCount =
    leads.filter(
      (lead) => lead.status === "NEW"
    ).length;

  const contactedCount =
    leads.filter(
      (lead) => lead.status === "CONTACTED"
    ).length;

  const wonCount =
    leads.filter(
      (lead) => lead.status === "WON"
    ).length;

  const lostCount =
    leads.filter(
      (lead) => lead.status === "LOST"
    ).length;

  const conversionRate =
    total === 0
      ? 0
      : Number(
          ((wonCount / total) * 100).toFixed(1)
        );

  const sourceMap: Record<string, number> =
    {};

  leads.forEach((lead) => {
    const source =
      lead.source || "Unknown";

    sourceMap[source] =
      (sourceMap[source] || 0) + 1;
  });

  return NextResponse.json({
    total,
    newCount,
    contactedCount,
    wonCount,
    lostCount,
    conversionRate,
    sourceMap,
  });
}