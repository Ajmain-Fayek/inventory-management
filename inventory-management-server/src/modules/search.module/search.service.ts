import { prisma } from "@/lib/prisma.js";

const normalizeQuery = (q: string) => q.trim();

const search = async (qRaw: string) => {
  const q = normalizeQuery(qRaw);
  if (!q) {
    return { inventories: [], items: [] };
  }

  const [inventories, items] = await Promise.all([
    prisma.inventory.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { categoryName: { contains: q, mode: "insensitive" } },
          {
            inventoryTags: {
              some: {
                tagName: { contains: q, mode: "insensitive" },
              },
            },
          },
          {
            creator: {
              name: { contains: q, mode: "insensitive" },
            },
          },
        ],
      },
      include: {
        inventoryTags: { select: { tagName: true } },
        creator: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    // NOTE: `customId` column is added in Prisma schema.
    // Until you run prisma migration + generate, Prisma Client types won't include it.
    // We keep this query compile-safe with `$queryRaw`.
    prisma.$queryRaw<
      Array<{
        id: string;
        customId: string;
        inventoryId: string;
        createdAt: Date;
        updatedAt: Date;
        inventoryTitle: string;
      }>
    >`
      SELECT
        i.id,
        i."customId",
        i."inventoryId",
        i."createdAt",
        i."updatedAt",
        inv.title as "inventoryTitle"
      FROM item i
      JOIN inventory inv ON inv.id = i."inventoryId"
      WHERE
        i."customId" ILIKE ${"%" + q + "%"}
        OR COALESCE(i."customString1Value", '') ILIKE ${"%" + q + "%"}
        OR COALESCE(i."customString2Value", '') ILIKE ${"%" + q + "%"}
        OR COALESCE(i."customString3Value", '') ILIKE ${"%" + q + "%"}
        OR COALESCE(i."customText1Value", '') ILIKE ${"%" + q + "%"}
        OR COALESCE(i."customText2Value", '') ILIKE ${"%" + q + "%"}
        OR COALESCE(i."customText3Value", '') ILIKE ${"%" + q + "%"}
      ORDER BY i."createdAt" DESC
      LIMIT 50
    `,
  ]);

  return {
    inventories: inventories.map((inv) => ({
      ...inv,
      inventoryTags: inv.inventoryTags.map((t) => t.tagName),
      creator: inv.creator.name,
      itemCount: inv._count.items,
    })),
    items: items.map((item) => ({
      id: item.id,
      customId: item.customId,
      inventoryId: item.inventoryId,
      inventoryTitle: item.inventoryTitle,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  };
};

export const SearchService = {
  search,
};

