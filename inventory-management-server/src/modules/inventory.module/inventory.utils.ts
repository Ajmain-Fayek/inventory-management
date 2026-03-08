import { TCreateInventoryPayload, TUpdateInventoryPayload } from "./inventory.validation.js";

type TCustomFieldConfigInput = NonNullable<TCreateInventoryPayload["customFieldConfig"]>;
type TUpdateCustomFieldConfigInput = NonNullable<TUpdateInventoryPayload["customFieldConfig"]>;
type TAnyCustomFieldConfigInput = TCustomFieldConfigInput | TUpdateCustomFieldConfigInput;

type TCreateTemplateInput = NonNullable<TCreateInventoryPayload["idTemplate"]>;
type TUpdateTemplateInput = NonNullable<Exclude<TUpdateInventoryPayload["idTemplate"], null>>;
type TAnyTemplateInput = TCreateTemplateInput | TUpdateTemplateInput;

type TCustomFieldStateKey =
  | "customString1State"
  | "customString2State"
  | "customString3State"
  | "customText1State"
  | "customText2State"
  | "customText3State"
  | "customInt1State"
  | "customInt2State"
  | "customInt3State"
  | "customBool1State"
  | "customBool2State"
  | "customBool3State";

type TCustomFieldValueKey =
  | "customString1Value"
  | "customString2Value"
  | "customString3Value"
  | "customText1Value"
  | "customText2Value"
  | "customText3Value"
  | "customInt1Value"
  | "customInt2Value"
  | "customInt3Value"
  | "customBool1Value"
  | "customBool2Value"
  | "customBool3Value";

type TCustomFieldShowInTable =
  | "customString1ShowInTable"
  | "customString2ShowInTable"
  | "customString3ShowInTable"
  | "customText1ShowInTable"
  | "customText2ShowInTable"
  | "customText3ShowInTable"
  | "customInt1ShowInTable"
  | "customInt2ShowInTable"
  | "customInt3ShowInTable"
  | "customBool1ShowInTable"
  | "customBool2ShowInTable"
  | "customBool3ShowInTable";

type TStateValuePair = readonly [
  TCustomFieldStateKey,
  TCustomFieldValueKey,
  TCustomFieldShowInTable,
];

const customFieldStateValuePairs: TStateValuePair[] = [
  ["customString1State", "customString1Value", "customString1ShowInTable"],
  ["customString2State", "customString2Value", "customString2ShowInTable"],
  ["customString3State", "customString3Value", "customString3ShowInTable"],
  ["customText1State", "customText1Value", "customText1ShowInTable"],
  ["customText2State", "customText2Value", "customText2ShowInTable"],
  ["customText3State", "customText3Value", "customText3ShowInTable"],
  ["customInt1State", "customInt1Value", "customInt1ShowInTable"],
  ["customInt2State", "customInt2Value", "customInt2ShowInTable"],
  ["customInt3State", "customInt3Value", "customInt3ShowInTable"],
  ["customBool1State", "customBool1Value", "customBool1ShowInTable"],
  ["customBool2State", "customBool2Value", "customBool2ShowInTable"],
  ["customBool3State", "customBool3Value", "customBool3ShowInTable"],
] as const;

export type TNormalizedCustomFieldConfig = Partial<{
  customString1State: boolean;
  customString1Value: string | null;
  customString1ShowInTable: boolean | null;

  customString2State: boolean;
  customString2Value: string | null;
  customString2ShowInTable: boolean | null;

  customString3State: boolean;
  customString3Value: string | null;
  customString3ShowInTable: boolean | null;

  customText1State: boolean;
  customText1Value: string | null;
  customText1ShowInTable: boolean | null;

  customText2State: boolean;
  customText2Value: string | null;
  customText2ShowInTable: boolean | null;

  customText3State: boolean;
  customText3Value: string | null;
  customText3ShowInTable: boolean | null;

  customInt1State: boolean;
  customInt1Value: string | null;
  customInt1ShowInTable: boolean | null;

  customInt2State: boolean;
  customInt2Value: string | null;
  customInt2ShowInTable: boolean | null;

  customInt3State: boolean;
  customInt3Value: string | null;
  customInt3ShowInTable: boolean | null;

  customBool1State: boolean;
  customBool1Value: string | null;
  customBool1ShowInTable: boolean | null;

  customBool2State: boolean;
  customBool2Value: string | null;
  customBool2ShowInTable: boolean | null;

  customBool3State: boolean;
  customBool3Value: string | null;
  customBool3ShowInTable: boolean | null;
}>;

export const normalizeCustomFieldConfig = (
  customFieldConfig?: TAnyCustomFieldConfigInput,
): TNormalizedCustomFieldConfig => {
  if (!customFieldConfig) {
    return {};
  }

  const data: Partial<
    Record<
      TCustomFieldStateKey | TCustomFieldValueKey | TCustomFieldShowInTable,
      string | number | boolean | null
    >
  > = {};

  for (const [stateKey, valueKey, showKey] of customFieldStateValuePairs) {
    if (stateKey in customFieldConfig) {
      const rawState = customFieldConfig[stateKey];
      if (rawState !== undefined) {
        data[stateKey] = rawState;
      }

      if (rawState === false) {
        data[valueKey] = null;
        data[showKey] = null;
        continue;
      }
    }

    if (valueKey in customFieldConfig) {
      data[valueKey] = customFieldConfig[valueKey] ?? null;
    }

    if (showKey in customFieldConfig) {
      data[showKey] = customFieldConfig[showKey] ?? null;
    }
  }

  return data as TNormalizedCustomFieldConfig;
};

export const normalizeTagNames = (tags?: string[]) => {
  if (!tags || tags.length === 0) {
    return [];
  }

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const tag of tags) {
    const trimmed = tag.trim();
    if (!trimmed) {
      continue;
    }

    if (seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
};

export interface TNormalizedIdTemplate {
  fixedValueState: boolean;
  fixedValue: string | null;
  fixedPosition: number | null;
  fixedSeparator: string | null;

  sequenceValueState: boolean;
  sequenceValue: string | null;
  sequenceValuePosition: number | null;
  sequenceSeparator: string | null;

  randomValueState: boolean;
  randomValue: string | null;
  randomValuePosition: number | null;
  randomSeparator: string | null;

  datetimeValueState: boolean;
  datetimeValue: string | null;
  datetimeValuePosition: number | null;
  datetimeSeparator: string | null;
}

export const normalizeIdTemplate = (template: TAnyTemplateInput): TNormalizedIdTemplate => {
  const normalized: TNormalizedIdTemplate = {
    fixedValueState: template.fixedValueState ?? false,
    fixedValue: null,
    fixedPosition: null,
    fixedSeparator: null,
    sequenceValueState: template.sequenceValueState ?? false,
    sequenceValue: null,
    sequenceValuePosition: null,
    sequenceSeparator: null,
    randomValueState: template.randomValueState ?? false,
    randomValue: null,
    randomValuePosition: null,
    randomSeparator: null,
    datetimeValueState: template.datetimeValueState ?? false,
    datetimeValue: null,
    datetimeValuePosition: null,
    datetimeSeparator: null,
  };

  if (normalized.fixedValueState) {
    normalized.fixedValue = template.fixedValue;
    normalized.fixedPosition = template.fixedPosition;
    normalized.fixedSeparator = template.fixedSeparator;
  }

  if (normalized.sequenceValueState) {
    normalized.sequenceValue = template.sequenceValue;
    normalized.sequenceValuePosition = template.sequenceValuePosition;
    normalized.sequenceSeparator = template.sequenceSeparator;
  }

  if (normalized.randomValueState) {
    normalized.randomValue = template.randomValue;
    normalized.randomValuePosition = template.randomValuePosition;
    normalized.randomSeparator = template.randomSeparator;
  }

  if (normalized.datetimeValueState) {
    normalized.datetimeValue = template.datetimeValue;
    normalized.datetimeValuePosition = template.datetimeValuePosition;
    normalized.datetimeSeparator = template.datetimeSeparator;
  }

  return normalized;
};
