import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function GET(req: Request) {
  const authUser = await validateHRAccess();

  if (!authUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json([], { status: 200 });
  }

  const departments = await prisma.department.findMany({
    where: { companyId },
    include: {
      _count: {
        select: { employees: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(departments);
}

/* CREATE DEPARTMENT */
export async function POST(req: Request) {
  const authUser = await validateHRAccess();

  if (!authUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { companyId, name, description } = body;

  if (!companyId || !name) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const department = await prisma.department.create({
    data: {
      companyId,
      name,
      description: description || null,
    },
  });

  return NextResponse.json(department);
}