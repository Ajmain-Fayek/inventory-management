import z from "zod";

const itemCustomFieldValuesSchema = z
  .object({
    customString1value: z.string().trim().min(1).max(255).nullable().optional(),
    customString2value: z.string().trim().min(1).max(255).nullable().optional(),
    customString3value: z.string().trim().min(1).max(255).nullable().optional(),
    customText1value: z.string().max(4000).nullable().optional(),
    customText2value: z.string().max(4000).nullable().optional(),
    customText3value: z.string().max(4000).nullable().optional(),
    customInt1value: z.number().int().nullable().optional(),
    customInt2value: z.number().int().nullable().optional(),
    customInt3value: z.number().int().nullable().optional(),
    customBool1value: z.boolean().nullable().optional(),
    customBool2value: z.boolean().nullable().optional(),
    customBool3value: z.boolean().nullable().optional(),
  })
  .strict();

const customIdValuesSchema = z
  .object({
    fixedValue: z.string().trim().min(1).max(255).nullable().optional(),
    sequenceValue: z.number().int().nullable().optional(),
    randomValue: z.string().trim().min(1).max(255).nullable().optional(),
    datetimeValue: z.string().trim().min(1).max(255).nullable().optional(),
  })
  .strict()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "customIdValues must contain at least one field",
  });

export const createItemSchema = z
  .object({
    customFieldValues: itemCustomFieldValuesSchema.optional(),
    customId: z.string().trim().min(1).max(255).optional(),
    customIdValues: customIdValuesSchema.optional(),
  })
  .strict()
  .refine((payload) => !(payload.customId && payload.customIdValues), {
    message: "Provide either customId or customIdValues, not both",
  });

export const updateItemSchema = z
  .object({
    customFieldValues: itemCustomFieldValuesSchema.optional(),
    customId: z.string().trim().min(1).max(255).optional(),
    customIdValues: customIdValuesSchema.optional(),
  })
  .strict()
  .refine((payload) => !(payload.customId && payload.customIdValues), {
    message: "Provide either customId or customIdValues, not both",
  })
  .refine((payload) => {
    const hasCustomFieldValues = Boolean(
      payload.customFieldValues && Object.keys(payload.customFieldValues).length > 0,
    );
    const hasManualCustomId = payload.customId !== undefined;
    const hasManualCustomIdValues = Boolean(
      payload.customIdValues && Object.keys(payload.customIdValues).length > 0,
    );

    return hasCustomFieldValues || hasManualCustomId || hasManualCustomIdValues;
  }, {
    message: "At least one field is required for update",
  });

export type TCreateItemPayload = z.infer<typeof createItemSchema>;
export type TUpdateItemPayload = z.infer<typeof updateItemSchema>;
