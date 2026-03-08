import { prisma } from "@/lib/prisma.js";
import { assembleCustomId, buildCustomIdValuePayload } from "./item.utils.js";
import { AppError } from "@/errorHelper/AppError.js";
import status from "http-status";

const getItems = async (inventoryId: string, options?: { page: number; recordLimit: number }) => {
  const page = options?.page && options.page > 0 ? options.page : 1;
  const recordLimit = options?.recordLimit && options.recordLimit > 0 ? options.recordLimit : 25;
  const limit = Math.min(recordLimit, 100); // safety for limit injection

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where: { inventoryId },
      include: {
        customIdValues: {
          omit: {
            inventoryId: true,
            itemId: true,
            createdAt: true,
            updatedAt: true,
            version: true,
          },
        },
        inventory: {
          select: {
            title: true,
            customIdTemplates: {
              omit: {
                id: true,
                inventoryId: true,
                createdAt: true,
                updatedAt: true,
                version: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
    }),

    prisma.item.count({
      where: {
        inventoryId,
      },
    }),
  ]);

  const result = items.map((item) => {
    const { inventory, customIdValues, ...rest } = item;

    return {
      customId: assembleCustomId(inventory.customIdTemplates!, customIdValues!),
      inventoryTitle: inventory.title,
      ...rest,
    };
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data: result,
    pagination: { total, totalPages, page, limit },
  };
};

const getItemById = async (itemId: string) => {
  const item = await prisma.item.findUnique({
    where: {
      id: itemId,
    },
    include: {
      customIdValues: {
        omit: {
          inventoryId: true,
          itemId: true,
          createdAt: true,
          updatedAt: true,
          version: true,
        },
      },
      inventory: {
        select: {
          title: true,
          customIdTemplates: {
            omit: {
              id: true,
              inventoryId: true,
              createdAt: true,
              updatedAt: true,
              version: true,
            },
          },
        },
      },
    },
  });

  if (!item) {
    throw new AppError("Item not found", status.NOT_FOUND);
  }

  const { inventory, customIdValues, ...rest } = item;

  return {
    customId: assembleCustomId(inventory.customIdTemplates!, customIdValues!),
    inventoryTitle: inventory.title,
    ...rest,
  };
};

// @ts-expect-error/no-explicit-any (payload)
const createItem = async (inventoryId: string, payload) => {
  const result = await prisma.$transaction(async (tx) => {
    const customIdTemplate = await tx.customIdTemplate.findUnique({
      where: {
        inventoryId,
      },
      omit: {
        id: true,
        inventoryId: true,
        createdAt: true,
        updatedAt: true,
        version: true,
      },
    });

    const lastCreatedId = await tx.customIdValue.findFirst({
      where: {
        inventoryId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        sequenceValue: true,
      },
    });

    const customIdValuePayload = buildCustomIdValuePayload(
      inventoryId,
      customIdTemplate!,
      lastCreatedId,
    );

    const createItem = await tx.item.create({
      data: {
        inventoryId,
        ...payload,
      },
      include: {
        inventory: {
          select: {
            title: true,
          },
        },
      },
    });

    const createCustomId = await tx.customIdValue.create({
      data: {
        itemId: createItem.id,
        ...customIdValuePayload,
      },
      select: {
        datetimeValue: true,
        fixedValue: true,
        randomValue: true,
        sequenceValue: true,
      },
    });

    return { createItem, createCustomId, customIdTemplate };
  });

  const { inventory, ...rest } = result.createItem;

  return {
    customId: assembleCustomId(result.customIdTemplate!, result.createCustomId!),
    inventoryTitle: inventory.title,
    ...rest,
  };
};

export const ItemService = {
  createItem,
  getItems,
  getItemById,
};
