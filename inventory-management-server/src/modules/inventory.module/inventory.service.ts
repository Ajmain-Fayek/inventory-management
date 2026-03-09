import { Prisma } from "@/generated/prisma/client.js";
import { AppError } from "@/errorHelper/AppError.js";
import { prisma } from "@/lib/prisma.js";
import status from "http-status";
import { TCreateInventoryPayload, TWriteAccess } from "./inventory.validation.js";
import {
  normalizeCustomFieldConfig,
  normalizeIdTemplate,
  normalizeTagNames,
} from "./inventory.utils.js";

const hasPrismaErrorCode = (error: unknown, code: string): boolean => {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return (error as { code?: unknown }).code === code;
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
      tagName: tagName.trim(),
    })),
    skipDuplicates: true,
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
        // @ts-ignore/I will fix it
        data: {
          title: payload.title.toLowerCase(),
          description: payload.description ?? null,
          quantity: payload.quantity ?? 0,
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

      if (payload.writeAccess !== undefined && payload.writeAccess?.length > 0) {
        await tx.writeAccess.createMany({
          data: [...payload.writeAccess.map((u) => ({ userId: u.id, inventoryId: inventory.id }))],
        });
      }

      const createdInventory = await tx.inventory.findUnique({
        where: {
          id: inventory.id,
        },
        select: {
          id: true,
          title: true,
        },
      });

      if (!createdInventory) {
        throw new AppError("Failed to load created inventory", status.INTERNAL_SERVER_ERROR);
      }

      return createdInventory;
    });

    return result;
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
    include: {
      inventoryTags: {
        select: {
          tagName: true,
        },
      },
      creator: {
        select: {
          name: true,
        },
      },
      writeAccesses: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      customIdTemplates: true,
    },
  });

  if (!inventory) {
    throw new AppError("Inventory not found", status.NOT_FOUND);
  }

  const { writeAccesses, creator, inventoryTags, ...rest } = inventory;

  const paylaod = {
    ...rest,
    inventoryTags: inventoryTags.map((t) => t.tagName),
    creator: creator.name,
    writeAccess: writeAccesses.map((wa) => wa.user),
  };

  return paylaod;
};

const getInventories = async (options?: { page?: number; recordLimit?: number }) => {
  const page = options?.page && options.page > 0 ? options.page : 1;
  const recordLimit = options?.recordLimit && options.recordLimit > 0 ? options.recordLimit : 15;
  const limit = Math.min(recordLimit, 50);

  const skip = (page - 1) * limit;

  const [inventories, total] = await Promise.all([
    prisma.inventory.findMany({
      include: {
        inventoryTags: {
          select: {
            tagName: true,
          },
        },
        creator: {
          select: {
            name: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
    }),
    prisma.inventory.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  const paylaod = inventories.map((inv) => ({
    ...inv,
    inventoryTags: inv.inventoryTags.map((t) => t.tagName),
    creator: inv.creator.name,
  }));

  return {
    data: paylaod,
    pagination: { total, totalPages, page, limit },
  };
};

const updateInventory = async (
  inventoryId: string,
  //@ts-expect-error
  inventoryPayload,
  //@ts-expect-error
  customIdTemplates,
  tags: string[],
  writeAccess: TWriteAccess[],
) => {
  await prisma.$transaction(async (tx) => {
    await tx.inventory.update({
      where: {
        id: inventoryId,
      },
      data: {
        ...inventoryPayload,
      },
    });

    await tx.customIdTemplate.upsert({
      where: {
        inventoryId,
      },
      update: {
        ...customIdTemplates,
      },
      create: {
        inventoryId,
        ...customIdTemplates,
      },
    });

    // update tags
    const existingTags = await tx.inventoryTag.findMany({
      where: {
        inventoryId,
      },
      select: {
        tagName: true,
      },
    });

    const existingTagNames = existingTags.map((t) => t.tagName);

    const tagsToCreate = tags.filter((t) => !existingTagNames.includes(t));
    const tagsToDelete = existingTagNames.filter((t) => !tags.includes(t));

    await tx.inventoryTag.deleteMany({
      where: {
        inventoryId,
        tagName: { in: tagsToDelete },
      },
    });

    await tx.inventoryTag.createMany({
      data: tagsToCreate.map((tagName) => ({ inventoryId, tagName })),
    });

    // update write access
    const existingWriteAccess = await tx.writeAccess.findMany({
      where: { inventoryId },
      select: { userId: true },
    });

    const existingUsers = existingWriteAccess.map((u) => u.userId);
    const requestedUsers = writeAccess.map((u) => u.id);

    const usersToCreate = requestedUsers.filter((u) => !existingUsers.includes(u));
    const usersToDelete = existingUsers.filter((u) => !requestedUsers.includes(u));

    await tx.writeAccess.deleteMany({
      where: {
        inventoryId,
        userId: { in: usersToDelete },
      },
    });

    await tx.writeAccess.createMany({
      data: usersToCreate.map((userId) => ({ inventoryId, userId })),
    });
  });

  return;
};

const lockInventory = async (inventoryId: string, userId: string) => {
  await prisma.inventory.update({
    where: { id: inventoryId },
    data: {
      isInEditMode: true,
      editingUserId: userId,
    },
  });

  return;
};

const releaseInventory = async (inventoryId: string) => {
  await prisma.inventory.update({
    where: { id: inventoryId },
    data: {
      isInEditMode: false,
      editingUserId: null,
    },
  });

  return;
};

export const InventoryService = {
  createInventory,
  getInventoryById,
  getInventories,
  updateInventory,
  lockInventory,
  releaseInventory,
};
