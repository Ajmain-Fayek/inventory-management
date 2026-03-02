import { Prisma } from "@/generated/prisma/client.js";
import { AppError } from "@/errorHelper/AppError.js";
import { prisma } from "@/lib/prisma.js";
import status from "http-status";
import { TCreateInventoryPayload, TUpdateInventoryPayload } from "./inventory.validation.js";
import {
  normalizeCustomFieldConfig,
  normalizeIdTemplate,
  normalizeTagNames,
} from "./inventory.utils.js";

const inventoryInclude = {
  inventoryTags: {
    select: {
      tagName: true,
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  customIdTemplates: {
    orderBy: {
      createdAt: "desc" as const,
    },
    take: 1,
  },
  creator: {
    select: {
      name: true,
    },
  },
};

const inventoryWithAccessInclude = {
  ...inventoryInclude,
  writeAccesses: {
    select: {
      userId: true,
    },
  },
};

type TInventoryWithRelations = Prisma.InventoryGetPayload<{
  include: typeof inventoryInclude;
}>;

const hasPrismaErrorCode = (error: unknown, code: string): boolean => {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return (error as { code?: unknown }).code === code;
};

type TInventoryResponseInput = TInventoryWithRelations & {
  writeAccesses?: { id: string }[];
};

const mapInventoryResponse = (
  inventory: TInventoryResponseInput & { creator?: { name: string } },
) => {
  const { inventoryTags, customIdTemplates, creator, ...rest } = inventory;
  delete (rest as { writeAccesses?: unknown }).writeAccesses;

  return {
    ...rest,
    tags: inventoryTags.map((entry) => entry.tagName),
    idTemplate: customIdTemplates[0] ?? null,
    creatorName: creator?.name ?? null,
  };
};

const resolveCategoryName = async (
  tx: Prisma.TransactionClient,
  payload: {
    categoryName: string | null | undefined;
  },
): Promise<string | null | undefined> => {
  if (payload.categoryName !== undefined) {
    return payload.categoryName;
  }

  if (payload.categoryName === undefined) {
    return undefined;
  }

  if (payload.categoryName === null) {
    return null;
  }

  const category = await tx.category.findUnique({
    where: {
      id: payload.categoryName,
    },
    select: {
      name: true,
    },
  });

  if (!category) {
    throw new AppError("Category not found", status.BAD_REQUEST);
  }

  return category.name;
};

const createInventoryTag = async (
  tx: Prisma.TransactionClient,
  inventoryId: string,
  tagNames: string[],
) => {
  if (tagNames.length === 0) {
    return;
  }

  await tx.inventoryTag.createMany({
    data: tagNames.map((tagName) => ({
      inventoryId,
      tagName,
    })),
    skipDuplicates: true,
  });
};

// TODO: Move to separate service file when more tag-related logic is added
const createTag = async (name: string) => {
  return await prisma.tag.create({
    data: {
      name,
    },
  });
};

const createInventory = async (userId: string, payload: TCreateInventoryPayload) => {
  const imageUrl = payload.imageUrl ?? null;
  const tags = normalizeTagNames(payload.tags);
  const customFieldConfig = normalizeCustomFieldConfig(payload.customFieldConfig);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const categoryName =
        (await resolveCategoryName(tx, {
          categoryName: payload.categoryName,
        })) ?? null;

      const inventory = await tx.inventory.create({
        data: {
          title: payload.title.toLowerCase(),
          description: payload.description ?? null,
          quantity: payload.quantity,
          isPublic: payload.isPublic ?? false,
          imageUrl,
          categoryName,
          creatorId: userId,
          ...customFieldConfig,
        },
      });

      if (tags.length > 0) {
        await createInventoryTag(tx, inventory.id, tags);
      }

      if (payload.idTemplate) {
        await tx.customIdTemplate.create({
          data: {
            inventoryId: inventory.id,
            ...normalizeIdTemplate(payload.idTemplate),
          },
        });
      }

      const createdInventory = await tx.inventory.findUnique({
        where: {
          id: inventory.id,
        },
        include: inventoryInclude,
      });

      if (!createdInventory) {
        throw new AppError("Failed to load created inventory", status.INTERNAL_SERVER_ERROR);
      }

      return createdInventory;
    });

    return mapInventoryResponse(result);
  } catch (error) {
    if (hasPrismaErrorCode(error, "P2002")) {
      throw new AppError("Inventory already exists", status.CONFLICT);
    }

    throw error;
  }
};

const getInventoryById = async (inventoryId: string) => {
  const inventory = await prisma.inventory.findUnique({
    where: {
      id: inventoryId,
    },
    include: inventoryInclude,
  });

  if (!inventory) {
    throw new AppError("Inventory not found", status.NOT_FOUND);
  }

  return mapInventoryResponse(inventory);
};

// const updateInventory = async (
//   inventoryId: string,
//   userId: string,
//   payload: TUpdateInventoryPayload,
// ) => {
//   const existing = await prisma.inventory.findUnique({
//     where: {
//       id: inventoryId,
//     },
//     select: {
//       id: true,
//       creatorId: true,
//     },
//   });

//   if (!existing) {
//     throw new AppError("Inventory not found", status.NOT_FOUND);
//   }

//   if (existing.creatorId !== userId) {
//     throw new AppError("Only inventory creator can update inventory settings", status.FORBIDDEN);
//   }

//   const tags = payload.tags ? normalizeTagNames(payload.tags) : undefined;
//   const customFieldConfig = normalizeCustomFieldConfig(payload.customFieldConfig);

//   try {
//     const result = await prisma.$transaction(async (tx) => {
//       const updateData: Prisma.InventoryUncheckedUpdateInput = {
//         ...customFieldConfig,
//       };

//       if (payload.title !== undefined) {
//         updateData.title = payload.title;
//       }

//       if (payload.description !== undefined) {
//         updateData.description = payload.description;
//       }

//       if (payload.quantity !== undefined) {
//         updateData.quantity = payload.quantity;
//       }

//       if (payload.isPublic !== undefined) {
//         updateData.isPublic = payload.isPublic;
//       }

//       if (payload.imageUrl !== undefined) {
//         updateData.imageUrl = payload.imageUrl ?? null;
//       }

//       const categoryName = await resolveCategoryName(tx, {
//         categoryName: payload.categoryName,
//       });

//       if (Object.keys(updateData).length > 0) {
//         await tx.inventory.update({
//           where: {
//             id: inventoryId,
//           },
//           data: updateData,
//         });
//       }

//       if (tags !== undefined) {
//         await createInventoryTag(tx, inventoryId, tags);
//       }

//       if (payload.idTemplate === null) {
//         await tx.customIdTemplate.deleteMany({
//           where: {
//             inventoryId,
//           },
//         });
//       } else if (payload.idTemplate) {
//         await tx.customIdTemplate.deleteMany({
//           where: {
//             inventoryId,
//           },
//         });

//         await tx.customIdTemplate.create({
//           data: {
//             inventoryId,
//             ...normalizeIdTemplate(payload.idTemplate),
//           },
//         });
//       }

//       const updatedInventory = await tx.inventory.findUnique({
//         where: {
//           id: inventoryId,
//         },
//         include: inventoryInclude,
//       });

//       if (!updatedInventory) {
//         throw new AppError("Inventory not found", status.NOT_FOUND);
//       }

//       return updatedInventory;
//     });

//     return mapInventoryResponse(result);
//   } catch (error) {
//     if (hasPrismaErrorCode(error, "P2002")) {
//       throw new AppError("Inventory title already exists", status.CONFLICT);
//     }

//     throw error;
//   }
// };

// Get Inventories with pagination, filtering, and sorting
const getInventories = async (options?: {
  page?: number;
  recordLimit?: number;
}) => {
  const page = options?.page && options.page > 0 ? options.page : 1;
  const recordLimit = options?.recordLimit && options.recordLimit > 0 ? options.recordLimit : 25;
  const limit = Math.min(recordLimit, 100); // safety for limit injection

  const skip = (page - 1) * limit;

  const [inventories, total] = await Promise.all([
    prisma.inventory.findMany({
      include: inventoryInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
    }),
    prisma.inventory.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: inventories.map(mapInventoryResponse),
    pagination: { total, totalPages, page, limit },
  };
};

export const InventoryService = {
  createInventory,
  getInventoryById,
  // updateInventory,
  createTag,
  getInventories,
};
