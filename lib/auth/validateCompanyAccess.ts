import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function validateCompanyAccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      role: true,        // ✅ IMPORTANT FIX
      company: true,     // optional but recommended
    },
  });

  return dbUser;
}