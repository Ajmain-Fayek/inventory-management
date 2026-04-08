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
      customId:
        (rest as { customId?: string }).customId ??
        assembleCustomId(inventory.customIdTemplates!, customIdValues!),
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
    customId:
      (rest as { customId?: string }).customId ??
      assembleCustomId(inventory.customIdTemplates!, customIdValues!),
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
        // will be updated after customIdValues are created
        customId: "",
        ...payload,
      },
      include: {
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

    const computedCustomId = assembleCustomId(createItem.inventory.customIdTemplates!, createCustomId);

    await tx.item.update({
      where: { id: createItem.id },
      data: { customId: computedCustomId } as any,
    });

    const { customId: _, ...createItemRest } = createItem as typeof createItem & { customId?: string };
    return {
      createItem: { ...createItemRest, customId: computedCustomId },
      createCustomId,
      customIdTemplate,
    };
  });

  const { inventory, customId: computedCustomId, ...rest } = result.createItem as typeof result.createItem & {
    customId: string;
  };

  return {
    customId: computedCustomId,
    inventoryTitle: inventory.title,
    ...rest,
  };
};

// @ts-expect-error/no-explicit-any (payload)
const updateItem = async (itemId: string, payload) => {
  const expectedVersion = payload?.version;
  if (typeof expectedVersion !== "number") {
    throw new AppError("Missing item version for optimistic locking", status.BAD_REQUEST);
  }

  const { version, ...updatePayload } = payload;
  const { customId, ...restUpdatePayload } = updatePayload;

  const result = await prisma.$transaction(async (tx) => {
    const updateData: any = {
      ...restUpdatePayload,
      ...(typeof customId === "string" ? { customId } : {}),
      version: { increment: 1 },
    };

    const updateResult = await tx.item.updateMany({
      where: { id: itemId, version: expectedVersion },
      data: updateData,
    });

    if (updateResult.count === 0) {
      throw new AppError(
        "This item was updated by another user. Refresh and try your changes again.",
        status.CONFLICT,
      );
    }

    const updatedItem = await tx.item.findUnique({
      where: { id: itemId },
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

    if (!updatedItem) {
      throw new AppError("Item not found", status.NOT_FOUND);
    }

    return updatedItem;
  });

  const { inventory, customIdValues, ...rest } = result;

  return {
    customId:
      (rest as { customId?: string }).customId ??
      assembleCustomId(inventory.customIdTemplates!, customIdValues!),
    inventoryTitle: inventory.title,
    ...rest,
  };
};

const deleteItem = async (itemId: string) => {
  try {
    await prisma.item.delete({
      where: { id: itemId },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      throw new AppError("Item not found", status.NOT_FOUND);
    }
    throw error;
  }
};

export const ItemService = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};
