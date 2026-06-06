import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser?.companyId) {
    return NextResponse.json([]);
  }

  const users = await prisma.user.findMany({
    where: {
      companyId: dbUser.companyId,
    },
    include: {
      role: true,
      employee: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(users);
}