import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser?.companyId) return NextResponse.json([]);

  const data = await prisma.attendance.findMany({
    where: {
      employee: {
        companyId: dbUser.companyId,
      },
    },
    include: {
      employee: {
        include: { user: true },
      },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(data);
}