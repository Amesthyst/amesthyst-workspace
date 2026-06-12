import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { leadId } = body;

  if (!leadId) {
    return NextResponse.json(
      { error: "Missing leadId" },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    return NextResponse.json(
      { error: "Lead not found" },
      { status: 404 }
    );
  }

  const contact = await prisma.contact.create({
    data: {
      companyId: lead.companyId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
    },
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: "WON",
      contactId: contact.id,
    },
  });

  return NextResponse.json({
    message: "Lead converted successfully",
    contact,
  });
}