import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const lastAttendance = await prisma.attendance.findFirst({
    where: {
      employeeId: employee.id,
      clockOut: null,
    },
    orderBy: {
      clockIn: "desc",
    },
  });

  if (!lastAttendance) {
    return NextResponse.json({ error: "No active attendance" }, { status: 400 });
  }

  const updated = await prisma.attendance.update({
    where: {
      id: lastAttendance.id,
    },
    data: {
      clockOut: new Date(),
    },
  });

  return NextResponse.json(updated);
}