import { prisma } from "@/lib/prisma.js";

const getUser = async (user: string) => {
  const result = await prisma.user.findMany({
    where: {
      email: {
        contains: user,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return result;
};

export const UserService = {
  getUser,
};
