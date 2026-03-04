import z from "zod";

// Type for Inventory with Relations
const customFieldConfigSchema = z
  .object({
    // Single Line
    customString1State: z.boolean().optional().default(false),
    customString1ShowInTable: z.boolean().nullable().optional(),
    customString1Value: z.string().nullable().optional(),

    customString2State: z.boolean().optional().default(false),
    customString2ShowInTable: z.boolean().nullable().optional(),
    customString2Value: z.string().nullable().optional(),

    customString3State: z.boolean().optional().default(false),
    customString3ShowInTable: z.boolean().nullable().optional(),
    customString3Value: z.string().nullable().optional(),

    // Multi-Line
    customText1State: z.boolean().optional().default(false),
    customText1ShowInTable: z.boolean().nullable().optional(),
    customText1Value: z.string().nullable().optional(),

    customText2State: z.boolean().optional().default(false),
    customText2ShowInTable: z.boolean().nullable().optional(),
    customText2Value: z.string().nullable().optional(),

    customText3State: z.boolean().optional().default(false),
    customText3ShowInTable: z.boolean().nullable().optional(),
    customText3Value: z.string().nullable().optional(),

    // Numeric
    customInt1State: z.boolean().optional().default(false),
    customInt1ShowInTable: z.boolean().nullable().optional(),
    customInt1Value: z.string().nullable().optional(),

    customInt2State: z.boolean().optional().default(false),
    customInt2ShowInTable: z.boolean().nullable().optional(),
    customInt2Value: z.string().nullable().optional(),

    customInt3State: z.boolean().optional().default(false),
    customInt3ShowInTable: z.boolean().nullable().optional(),
    customInt3Value: z.string().nullable().optional(),

    // Boolean
    customBool1State: z.boolean().optional().default(false),
    customBool1ShowInTable: z.boolean().nullable().optional(),
    customBool1Value: z.string().nullable().optional(),

    customBool2State: z.boolean().optional().default(false),
    customBool2ShowInTable: z.boolean().nullable().optional(),
    customBool2Value: z.string().nullable().optional(),

    customBool3State: z.boolean().optional().default(false),
    customBool3ShowInTable: z.boolean().nullable().optional(),
    customBool3Value: z.string().nullable().optional(),
  })
  .strict();

const slotPositionSchema = z.number().int().min(0).max(3);

// Custom ID Template Validation Schema
const customIdTemplateSchema = z
  .object({
    currentSequence: z.number().int().positive().optional(),

    fixedValueState: z.boolean().optional(),
    fixedValue: z.string().trim().nullable().optional(),
    fixedPosition: slotPositionSchema.nullable().optional(),
    fixedSeparator: z.string().trim().nullable().optional(),

    sequenceValueState: z.boolean().optional(),
    sequenceValue: z.string().trim().nullable().optional(),
    sequenceValuePosition: slotPositionSchema.nullable().optional(),
    sequenceSeparator: z.string().trim().nullable().optional(),

    randomValueState: z.boolean().optional(),
    randomValue: z.string().trim().nullable().optional(),
    randomValuePosition: slotPositionSchema.nullable().optional(),
    randomSeparator: z.string().trim().nullable().optional(),

    datetimeValueState: z.boolean().optional(),
    datetimeValue: z.string().trim().nullable().optional(),
    datetimeValuePosition: slotPositionSchema.nullable().optional(),
    datetimeSeparator: z.string().trim().nullable().optional(),
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
    title: z.string().trim(),
    description: z.string().max(4000).optional(),
    quantity: z.number().int().nonnegative().default(0).optional(),
    isPublic: z.boolean().optional().default(false),
    imageUrl: z.string().optional(),
    categoryName: z.string().optional(),
    customFieldConfig: customFieldConfigSchema.optional(),
    idTemplate: customIdTemplateSchema.required(),
    tags: z.string().array().optional(),
    writeAccess: z.string().array().optional(),
  })
  .strict();

export const updateInventorySchema = z
  .object({
    title: z.string().trim().optional(),
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
