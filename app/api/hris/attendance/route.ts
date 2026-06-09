import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const WORK_START = 9;
const WORK_END = 17;

export async function POST() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const now = new Date();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId: employee.id,
      date: today,
    },
  });

  // ================= CLOCK IN =================
  if (!attendance) {
    const workStart = new Date();
    workStart.setHours(WORK_START, 0, 0, 0);

    const lateMinutes =
      now > workStart
        ? Math.floor((now.getTime() - workStart.getTime()) / 60000)
        : 0;

    const record = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        clockIn: now,
        lateMinutes,
        status: lateMinutes > 0 ? "LATE" : "PRESENT",
      },
    });

    return NextResponse.json({ type: "CLOCK_IN", record });
  }

  // ================= CLOCK OUT =================
  if (!attendance.clockOut) {
    const workMinutes = Math.floor(
      (now.getTime() - attendance.clockIn!.getTime()) / 60000
    );

    const workEnd = new Date();
    workEnd.setHours(WORK_END, 0, 0, 0);

    const overtimeMinutes =
      now > workEnd
        ? Math.floor((now.getTime() - workEnd.getTime()) / 60000)
        : 0;

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut: now,
        workMinutes,
        overtimeMinutes,
        status: overtimeMinutes > 0 ? "OVERTIME" : attendance.status,
      },
    });

    return NextResponse.json({ type: "CLOCK_OUT", record: updated });
  }

  return NextResponse.json({ message: "Already completed today" });
}