type FieldType = "text" | "textarea" | "integer" | "boolean";

interface CustomField {
  id: string;
  type: FieldType;
  name: string;
  showInTable: boolean;
}

type FieldsInput = Record<FieldType, CustomField[]>;

interface CustomFieldConfig {
  [key: string]: boolean | string;
}

export function transformToCustomFieldConfig(fields: FieldsInput): CustomFieldConfig {
  const result: CustomFieldConfig = {};

  const typeMapping: Record<FieldType, { prefix: string; max: number }> = {
    text: { prefix: "customString", max: 3 },
    textarea: { prefix: "customText", max: 3 },
    integer: { prefix: "customInt", max: 3 },
    boolean: { prefix: "customBool", max: 3 },
  };

  (Object.keys(typeMapping) as FieldType[]).forEach((type) => {
    const { prefix, max } = typeMapping[type];
    const typeFields = fields[type] || [];

    for (let i = 0; i < max; i++) {
      const field = typeFields[i];
      const index = i + 1;

      const stateKey = `${prefix}${index}State`;

      if (!field) {
        // Only State when field does not exist
        result[stateKey] = false;
        continue;
      }

      // If field exists
      result[stateKey] = true;
      result[`${prefix}${index}ShowInTable`] = field.showInTable;
      result[`${prefix}${index}Value`] = field.name;
    }
  });

  return result;
}
