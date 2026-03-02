import { prisma } from "@/lib/prisma.js";

const getTag = async (name: string) => {
  const tag = await prisma.tag.findMany({
    where: {
      name: {
        contains: name,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return tag;
};

const createTag = async (name: string) => {
  const tag = await prisma.tag.create({
    data: {
      name,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return tag;
};

export const TagService = {
  getTag,
  createTag,
};
