import z from "zod";

// Type for Inventory with Relations
const customFieldConfigSchema = z
  .object({
    customString1State: z.boolean().optional().default(false),
    customString1Value: z.string().nullable().optional(),
    customString2State: z.boolean().optional().default(false),
    customString2Value: z.string().nullable().optional(),
    customString3State: z.boolean().optional().default(false),
    customString3Value: z.string().nullable().optional(),
    customText1State: z.boolean().optional().default(false),
    customText1Value: z.string().nullable().optional(),
    customText2State: z.boolean().optional().default(false),
    customText2Value: z.string().nullable().optional(),
    customText3State: z.boolean().optional().default(false),
    customText3Value: z.string().nullable().optional(),
    customInt1State: z.boolean().optional().default(false),
    customInt1Value: z.string().nullable().optional(),
    customInt2State: z.boolean().optional().default(false),
    customInt2Value: z.string().nullable().optional(),
    customInt3State: z.boolean().optional().default(false),
    customInt3Value: z.string().nullable().optional(),
    customBool1State: z.boolean().optional().default(false),
    customBool1Value: z.string().nullable().optional(),
    customBool2State: z.boolean().optional().default(false),
    customBool2Value: z.string().nullable().optional(),
    customBool3State: z.boolean().optional().default(false),
    customBool3Value: z.string().nullable().optional(),
  })
  .strict();

const slotPositionSchema = z.number().int().min(0).max(3);

// Custom ID Template Validation Schema
const customIdTemplateSchema = z
  .object({
    currentSequence: z.number().int().positive().optional(),
    fixedValueState: z.boolean().optional(),
    fixedValue: z.string().trim().min(1).max(255).nullable().optional(),
    fixedPosition: slotPositionSchema.nullable().optional(),
    sequenceValueState: z.boolean().optional(),
    sequenceValue: z.number().int().min(0).nullable().optional(),
    sequenceValuePosition: slotPositionSchema.nullable().optional(),
    randomValueState: z.boolean().optional(),
    randomValue: z.string().trim().min(1).max(100).nullable().optional(),
    randomValuePosition: slotPositionSchema.nullable().optional(),
    datetimeValueState: z.boolean().optional(),
    datetimeValue: z.string().trim().min(1).max(100).nullable().optional(),
    datetimeValuePosition: slotPositionSchema.nullable().optional(),
  })
  .strict()
  .refine(
    (data) => {
      const positions = [
        data.fixedPosition,
        data.sequenceValuePosition,
        data.randomValuePosition,
        data.datetimeValuePosition,
      ].filter((pos): pos is number => pos !== null && pos !== undefined);

      const uniquePositions = [...new Set(positions)];
      return uniquePositions.length === positions.length;
    },
    {
      message: "Duplicate slot positions are not allowed",
    },
  );

// Create Inventory Validation Schemas
export const createInventorySchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    description: z.string().max(4000).optional(),
    quantity: z.number().int().nonnegative().default(0),
    isPublic: z.boolean().optional().default(false),
    imageUrl: z.string().optional(),
    categoryName: z.string().optional(),
    customFieldConfig: customFieldConfigSchema.optional(),
    idTemplate: customIdTemplateSchema.required(),
    tags: z.string().array().optional(),
  })
  .strict();

export const updateInventorySchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().max(4000).optional(),
    quantity: z.number().int().nonnegative().default(0),
    isPublic: z.boolean().optional().default(false),
    imageUrl: z.string().optional(),
    categoryName: z.string().optional(),
    customFieldConfig: customFieldConfigSchema.optional(),
    idTemplate: customIdTemplateSchema.required(),
    tags: z.string().array().optional(),
  })
  .strict()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required for update",
  });

export type TCreateInventoryPayload = z.infer<typeof createInventorySchema>;
export type TUpdateInventoryPayload = z.infer<typeof updateInventorySchema>;
