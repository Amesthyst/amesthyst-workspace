import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

// GET ALL PAYROLLS
export async function GET(req: Request) {
  const user = await validateHRAccess();

  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return NextResponse.json([]);

  const payrolls = await prisma.payroll.findMany({
    where: { companyId },
    include: {
      employee: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payrolls);
}

// CREATE PAYROLL
export async function POST(req: Request) {
  const user = await validateHRAccess();

  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const baseSalary = Number(body.baseSalary || 0);
  const allowance = Number(body.allowance || 0);
  const deduction = Math.floor(baseSalary * 0.05);

  const totalSalary = baseSalary + allowance - deduction;

  const payroll = await prisma.payroll.create({
    data: {
      employeeId: body.employeeId,
      companyId: body.companyId,
      month: body.month,
      year: body.year,
      baseSalary,
      allowance,
      deduction,
      totalSalary,
      status: "DRAFT",
    },
  });

  return NextResponse.json(payroll);
}