import { prisma } from "@/lib/prisma.js";

const getCategories = async () => {
  const category = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return category;
};

export const CategoryService = {
  getCategories,
};
