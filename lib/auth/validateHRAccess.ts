import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function validateHRAccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      role: true,
    },
  });

  if (!dbUser) {
    return null;
  }

  const role = dbUser.role?.name;

  if (
    role !== "OWNER" &&
    role !== "ADMIN"
  ) {
    return null;
  }

  return dbUser;
}