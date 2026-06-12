import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function GET(req: Request) {
  try {
    const user = await validateHRAccess();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!user.companyId) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const skip = (page - 1) * limit;

    const logs = await prisma.auditLog.findMany({
      where: {
        companyId: user.companyId,
      },
      include: {
        user: {
          include: {
            employee: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const total = await prisma.auditLog.count({
      where: {
        companyId: user.companyId,
      },
    });

    return NextResponse.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET AUDIT LOG ERROR", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}