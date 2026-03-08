// REMEMBER: To render columns in Inventory page

import {
  TCustomStateKey,
  TCustomValueKeyPair,
  TCustomValueKey,
  IInventory,
  TShowInTableKey,
  CUSTOM_FIELD_CONFIG,
  TCustomFieldType,
} from "../_interface";

export const getInventoryColumns = async (
  inventory: IInventory,
): Promise<TCustomValueKeyPair[]> => {
  const data: TCustomValueKeyPair[] = [];

  for (const field of CUSTOM_FIELD_CONFIG) {
    for (let i = 1; i <= 3; i++) {
      const stateKey = `${field.prefix}${i}State` as TCustomStateKey;
      const valueKey = `${field.prefix}${i}Value` as TCustomValueKey;
      const showInTable = `${field.prefix}${i}ShowInTable` as TShowInTableKey;

      if (inventory[stateKey]) {
        // [key, value of key = label, type,  show in table = boolean]
        data.push([
          valueKey,
          inventory[valueKey] as string,
          field.type as TCustomFieldType,
          Boolean(inventory[showInTable]),
        ]);
      }
    }
  }

  return data;
};
