// REMEMBER: Ready payload for saving iventory

import { ICustomField, TCustomFieldType, CUSTOM_FIELD_CONFIG } from "../_interface";

type FieldsInput = Record<TCustomFieldType, ICustomField[]>;

interface CustomFieldConfig {
  [key: string]: boolean | string | null;
}

export function transformToCustomFieldConfig(fields: FieldsInput): CustomFieldConfig {
  const result: CustomFieldConfig = {};

  CUSTOM_FIELD_CONFIG.forEach(({ type, prefix }) => {
    const typeFields = fields[type as TCustomFieldType] || [];
    const max = 3;

    for (let i = 0; i < max; i++) {
      const field = typeFields[i];
      const index = i + 1;

      const stateKey = `${prefix}${index}State`;
      const showInTableKey = `${prefix}${index}ShowInTable`;
      const valueKey = `${prefix}${index}Value`;

      if (!field) {
        result[stateKey] = false;
        result[showInTableKey] = null;
        result[valueKey] = null;
      } else {
        result[stateKey] = true;
        result[showInTableKey] = field.showInTable ?? false;
        result[valueKey] = field.name || "";
      }
    }
  });

  return result;
}
