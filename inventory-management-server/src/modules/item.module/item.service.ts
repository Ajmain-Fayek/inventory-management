import { Prisma } from "@/generated/prisma/client.js";
import { AppError } from "@/errorHelper/AppError.js";
import { prisma } from "@/lib/prisma.js";
import status from "http-status";
import { TCreateItemPayload, TUpdateItemPayload } from "./item.validation.js";
import { validateAndMapCustomFieldValues } from "./customFieldValueValidator.js";
import { validateResolvedIdTemplate } from "./idTemplateValidator.js";
import {
  composeCustomIdFromStoredValue,
  renderCustomIdFromTemplate,
  TRenderableIdTemplate,
  TStoredCustomIdValue,
} from "./idTemplateRenderer.js";

const itemInclude = {
  customIdValues: {
    orderBy: {
      createdAt: "desc" as const,
    },
    take: 1,
  },
};

type TItemWithCustomId = Prisma.ItemGetPayload<{
  include: typeof itemInclude;
}>;

type TInventoryWithAccess = Prisma.InventoryGetPayload<{
  include: {
    writeAccesses: {
      select: {
        id: true;
      };
    };
    customIdTemplates: {
      orderBy: {
        createdAt: "desc";
      };
      take: 1;
    };
  };
}>;

interface TCustomIdValuePayload {
  fixedValue: string | null;
  sequenceValue: number | null;
  randomValue: string | null;
  datetimeValue: string | null;
}

const hasCustomIdPayloadValues = (value: TCustomIdValuePayload) => {
  return (
    value.fixedValue !== null ||
    value.sequenceValue !== null ||
    value.randomValue !== null ||
    value.datetimeValue !== null
  );
};

const toRenderableTemplate = (inventory: TInventoryWithAccess): TRenderableIdTemplate | null => {
  const template = inventory.customIdTemplates[0];

  if (!template) {
    return null;
  }

  return {
    fixedValueState: template.fixedValueState,
    fixedValue: template.fixedValue,
    fixedPosition: template.fixedPosition,
    sequenceValueState: template.sequenceValueState,
    sequenceValue: template.sequenceValue,
    sequenceValuePosition: template.sequenceValuePosition,
    randomValueState: template.randomValueState,
    randomValue: template.randomValue,
    randomValuePosition: template.randomValuePosition,
    datetimeValueState: template.datetimeValueState,
    datetimeValue: template.datetimeValue,
    datetimeValuePosition: template.datetimeValuePosition,
  };
};

const extractStoredCustomId = (item: TItemWithCustomId): TStoredCustomIdValue | null => {
  const value = item.customIdValues[0];

  if (!value) {
    return null;
  }

  return {
    fixedValue: value.fixedValue,
    sequenceValue: value.sequenceValue,
    randomValue: value.randomValue,
    datetimeValue: value.datetimeValue,
  };
};

const mapItemResponse = (item: TItemWithCustomId, template: TRenderableIdTemplate | null) => {
  const customIdValue = extractStoredCustomId(item);

  return {
    ...item,
    customIdValue,
    customId: composeCustomIdFromStoredValue(template, customIdValue),
  };
};

const normalizeManualCustomIdInput = (
  payload: Pick<TCreateItemPayload | TUpdateItemPayload, "customId" | "customIdValues">,
): TCustomIdValuePayload | undefined | null => {
  if (payload.customId !== undefined) {
    return {
      fixedValue: payload.customId,
      sequenceValue: null,
      randomValue: null,
      datetimeValue: null,
    };
  }

  if (payload.customIdValues === undefined) {
    return undefined;
  }

  const normalized: TCustomIdValuePayload = {
    fixedValue: payload.customIdValues.fixedValue ?? null,
    sequenceValue: payload.customIdValues.sequenceValue ?? null,
    randomValue: payload.customIdValues.randomValue ?? null,
    datetimeValue: payload.customIdValues.datetimeValue ?? null,
  };

  if (!hasCustomIdPayloadValues(normalized)) {
    return null;
  }

  return normalized;
};

const getInventoryWithAccess = async (
  inventoryId: string,
  userId: string,
  mode: "read" | "write",
) => {
  const inventory = await prisma.inventory.findUnique({
    where: {
      id: inventoryId,
    },
    include: {
      writeAccesses: {
        where: {
          userId,
        },
        select: {
          id: true,
        },
      },
      customIdTemplates: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!inventory) {
    throw new AppError("Inventory not found", status.NOT_FOUND);
  }

  const canRead =
    inventory.isPublic || inventory.creatorId === userId || inventory.writeAccesses.length > 0;
  const canWrite = inventory.creatorId === userId || inventory.writeAccesses.length > 0;

  if (mode === "read" && !canRead) {
    throw new AppError("You do not have access to this inventory", status.FORBIDDEN);
  }

  if (mode === "write" && !canWrite) {
    throw new AppError("You do not have write access to this inventory", status.FORBIDDEN);
  }

  return inventory;
};

const createItem = async (inventoryId: string, userId: string, payload: TCreateItemPayload) => {
  const inventory = await getInventoryWithAccess(inventoryId, userId, "write");
  const template = toRenderableTemplate(inventory);

  const mappedCustomFields = validateAndMapCustomFieldValues(inventory, payload.customFieldValues);
  const manualCustomIdInput = normalizeManualCustomIdInput(payload);

  const createdItem = await prisma.$transaction(async (tx) => {
    const createdAt = new Date();

    const item = await tx.item.create({
      data: {
        inventoryId,
        createdAt,
        ...mappedCustomFields,
      },
      include: itemInclude,
    });

    let customIdValuePayload = manualCustomIdInput ?? null;

    if (manualCustomIdInput === undefined && template) {
      validateResolvedIdTemplate(template);

      let sequenceCounter = 0;

      if (template.sequenceValueState) {
        const existingTemplate = inventory.customIdTemplates[0];
        if (!existingTemplate) {
          throw new AppError("ID template not found", status.BAD_REQUEST);
        }

        if (existingTemplate.currentSequence === null) {
          await tx.customIdTemplate.update({
            where: {
              id: existingTemplate.id,
            },
            data: {
              currentSequence: 1,
            },
          });
        }

        const updatedTemplate = await tx.customIdTemplate.update({
          where: {
            id: existingTemplate.id,
          },
          data: {
            currentSequence: {
              increment: 1,
            },
          },
          select: {
            currentSequence: true,
          },
        });

        sequenceCounter = (updatedTemplate.currentSequence ?? 1) - 1;
      }

      const renderedCustomId = renderCustomIdFromTemplate(template, sequenceCounter, createdAt);
      customIdValuePayload = {
        fixedValue: renderedCustomId.fixedValue,
        sequenceValue: renderedCustomId.sequenceValue,
        randomValue: renderedCustomId.randomValue,
        datetimeValue: renderedCustomId.datetimeValue,
      };
    }

    if (customIdValuePayload && hasCustomIdPayloadValues(customIdValuePayload)) {
      await tx.customIdValue.create({
        data: {
          itemId: item.id,
          fixedValue: customIdValuePayload.fixedValue,
          sequenceValue: customIdValuePayload.sequenceValue,
          randomValue: customIdValuePayload.randomValue,
          datetimeValue: customIdValuePayload.datetimeValue,
          createdAt,
        },
      });
    }

    const createdItemWithCustomId = await tx.item.findUnique({
      where: {
        id: item.id,
      },
      include: itemInclude,
    });

    if (!createdItemWithCustomId) {
      throw new AppError("Failed to load created item", status.INTERNAL_SERVER_ERROR);
    }

    return createdItemWithCustomId;
  });

  return mapItemResponse(createdItem, template);
};

const listItemsByInventory = async (inventoryId: string, userId: string) => {
  const inventory = await getInventoryWithAccess(inventoryId, userId, "read");
  const template = toRenderableTemplate(inventory);

  const items = await prisma.item.findMany({
    where: {
      inventoryId,
    },
    include: itemInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return items.map((item) => mapItemResponse(item, template));
};

const getItemById = async (inventoryId: string, itemId: string, userId: string) => {
  const inventory = await getInventoryWithAccess(inventoryId, userId, "read");
  const template = toRenderableTemplate(inventory);

  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      inventoryId,
    },
    include: itemInclude,
  });

  if (!item) {
    throw new AppError("Item not found", status.NOT_FOUND);
  }

  return mapItemResponse(item, template);
};

const updateItem = async (
  inventoryId: string,
  itemId: string,
  userId: string,
  payload: TUpdateItemPayload,
) => {
  const inventory = await getInventoryWithAccess(inventoryId, userId, "write");
  const template = toRenderableTemplate(inventory);

  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      inventoryId,
    },
    select: {
      id: true,
    },
  });

  if (!item) {
    throw new AppError("Item not found", status.NOT_FOUND);
  }

  const mappedCustomFields = validateAndMapCustomFieldValues(inventory, payload.customFieldValues);
  const manualCustomIdInput = normalizeManualCustomIdInput(payload);

  const updatedItem = await prisma.$transaction(async (tx) => {
    if (Object.keys(mappedCustomFields).length > 0) {
      await tx.item.update({
        where: {
          id: itemId,
        },
        data: {
          ...mappedCustomFields,
        },
      });
    }

    if (payload.customId !== undefined || payload.customIdValues !== undefined) {
      await tx.customIdValue.deleteMany({
        where: {
          itemId,
        },
      });

      if (manualCustomIdInput && hasCustomIdPayloadValues(manualCustomIdInput)) {
        await tx.customIdValue.create({
          data: {
            itemId,
            fixedValue: manualCustomIdInput.fixedValue,
            sequenceValue: manualCustomIdInput.sequenceValue,
            randomValue: manualCustomIdInput.randomValue,
            datetimeValue: manualCustomIdInput.datetimeValue,
          },
        });
      }
    }

    const itemWithCustomId = await tx.item.findUnique({
      where: {
        id: itemId,
      },
      include: itemInclude,
    });

    if (!itemWithCustomId) {
      throw new AppError("Item not found", status.NOT_FOUND);
    }

    return itemWithCustomId;
  });

  return mapItemResponse(updatedItem, template);
};

const getItems = async (inventoryId: string, options?: { page: number; recordLimit: number }) => {
  const page = options?.page && options.page > 0 ? options.page : 1;
  const recordLimit = options?.recordLimit && options.recordLimit > 0 ? options.recordLimit : 25;
  const limit = Math.min(recordLimit, 100); // safety for limit injection

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where: { inventoryId },
      include: itemInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
    }),
    prisma.item.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: items,
    pagination: { total, totalPages, page, limit },
  };
};

export const ItemService = {
  createItem,
  listItemsByInventory,
  getItemById,
  updateItem,
  getItems,
};
