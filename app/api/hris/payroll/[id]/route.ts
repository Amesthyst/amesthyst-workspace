import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateHRAccess();

    if (!user) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing payroll id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const payroll = await prisma.payroll.findUnique({
      where: { id },
    });

    if (!payroll) {
      return NextResponse.json(
        { error: "Payroll not found" },
        { status: 404 }
      );
    }

    const safeNumber = (v: any, fallback: number) => {
      const n = Number(v);
      return isNaN(n) ? fallback : n;
    };

    const updated = await prisma.payroll.update({
      where: { id },
      data: {
        status: body.status ?? payroll.status,

        baseSalary:
          body.baseSalary !== undefined
            ? safeNumber(body.baseSalary, payroll.baseSalary)
            : payroll.baseSalary,

        allowance:
          body.allowance !== undefined
            ? safeNumber(body.allowance, payroll.allowance)
            : payroll.allowance,

        deduction:
          body.deduction !== undefined
            ? safeNumber(body.deduction, payroll.deduction)
            : payroll.deduction,

        month:
          body.month !== undefined
            ? safeNumber(body.month, payroll.month)
            : payroll.month,

        year:
          body.year !== undefined
            ? safeNumber(body.year, payroll.year)
            : payroll.year,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PAYROLL PATCH ERROR:", err);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        detail: err?.message,
      },
      { status: 500 }
    );
  }
}