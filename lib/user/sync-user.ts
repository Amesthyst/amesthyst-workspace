import { prisma } from "@/lib/prisma";

export async function syncUserToDatabase(user: {
  id: string;
  email?: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (existing) return existing;

  const newUser = await prisma.user.create({
    data: {
      id: user.id,
      email: user.email ?? "",
      companyId: null,
      roleId: null,
      isActive: true,
    },
  });

  return newUser;
}