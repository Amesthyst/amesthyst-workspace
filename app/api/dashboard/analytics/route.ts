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
  });

  const pipeline = {
    NEW: 0,
    CONTACTED: 0,
    WON: 0,
    LOST: 0,
  };

  let revenue = 0;

  for (const lead of leads) {
    pipeline[lead.status as keyof typeof pipeline]++;

    if (lead.status === "WON") {
      revenue += 1000;
    }
  }

  const totalLeads = leads.length;

  const winRate =
    totalLeads > 0
      ? (pipeline.WON / totalLeads) * 100
      : 0;

  const forecast =
    (pipeline.NEW + pipeline.CONTACTED) * 1000;

  return NextResponse.json({
    pipeline,
    revenue,
    winRate,
    forecast,
  });
}