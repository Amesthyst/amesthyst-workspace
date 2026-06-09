import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const present =
    await prisma.attendance.count({
      where: {
        date: {
          gte: today,
        },
      },
    });

  const late =
    await prisma.attendance.count({
      where: {
        date: {
          gte: today,
        },
        lateMinutes: {
          gt: 0,
        },
      },
    });

  const overtime =
    await prisma.attendance.count({
      where: {
        date: {
          gte: today,
        },
        overtimeMinutes: {
          gt: 0,
        },
      },
    });

  return NextResponse.json({
    present,
    late,
    overtime,
  });
}