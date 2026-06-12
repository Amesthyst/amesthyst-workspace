import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function GET(req: Request) {
  const user = await validateHRAccess();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);

  const companyId = searchParams.get("companyId");

  const projects = await prisma.project.findMany({
    where: {
        companyId: companyId ? companyId : undefined,
    },
    include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const user = await validateHRAccess();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  if (!user.companyId) {
    return NextResponse.json(
      { error: "Company not found" },
      { status: 400 }
    );
  }
  
  const project = await prisma.project.create({
    data: {
      companyId: user.companyId,
      name: body.name,
      description: body.description,
      status: "PLANNING",
      startDate: body.startDate
        ? new Date(body.startDate)
        : null,
      endDate: body.endDate
        ? new Date(body.endDate)
        : null,
    },
  });

  return NextResponse.json(project);
}