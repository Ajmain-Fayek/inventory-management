// REMEMBER: To update the inventory update custom fields form (Tab: Custom Fields)

import { CUSTOM_FIELD_CONFIG, IInventory, ICustomField, ICustomFieldsState } from "../_interface";

export function inventoryToCustomFields(inv: IInventory): ICustomFieldsState {
  const result: Partial<ICustomFieldsState> = {};

  for (const field of CUSTOM_FIELD_CONFIG) {
    const fields: ICustomField[] = [];

    for (let i = 1; i <= 3; i++) {
      const stateKey = `${field.prefix}${i}State` as keyof IInventory;
      const valueKey = `${field.prefix}${i}Value` as keyof IInventory;
      const showKey = `${field.prefix}${i}ShowInTable` as keyof IInventory;

      if (inv[stateKey]) {
        fields.push({
          id: crypto.randomUUID(),
          type: field.type as ICustomField["type"],
          name: (inv[valueKey] as string) ?? "",
          showInTable: Boolean(inv[showKey]),
        });
      }
    }
    result[field.type as keyof ICustomFieldsState] = fields;
  }

  return result as ICustomFieldsState;
}
