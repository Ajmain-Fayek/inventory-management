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

type TStateValuePair = readonly [TCustomFieldStateKey, TCustomFieldValueKey];

const customFieldStateValuePairs: TStateValuePair[] = [
  ["customString1State", "customString1Value"],
  ["customString2State", "customString2Value"],
  ["customString3State", "customString3Value"],
  ["customText1State", "customText1Value"],
  ["customText2State", "customText2Value"],
  ["customText3State", "customText3Value"],
  ["customInt1State", "customInt1Value"],
  ["customInt2State", "customInt2Value"],
  ["customInt3State", "customInt3Value"],
  ["customBool1State", "customBool1Value"],
  ["customBool2State", "customBool2Value"],
  ["customBool3State", "customBool3Value"],
] as const;

export type TNormalizedCustomFieldConfig = Partial<{
  customString1State: boolean;
  customString1Value: string | null;
  customString2State: boolean;
  customString2Value: string | null;
  customString3State: boolean;
  customString3Value: string | null;
  customText1State: boolean;
  customText1Value: string | null;
  customText2State: boolean;
  customText2Value: string | null;
  customText3State: boolean;
  customText3Value: string | null;
  customInt1State: boolean;
  customInt1Value: string | null;
  customInt2State: boolean;
  customInt2Value: string | null;
  customInt3State: boolean;
  customInt3Value: string | null;
  customBool1State: boolean;
  customBool1Value: string | null;
  customBool2State: boolean;
  customBool2Value: string | null;
  customBool3State: boolean;
  customBool3Value: string | null;
}>;

export const normalizeCustomFieldConfig = (
  customFieldConfig?: TAnyCustomFieldConfigInput,
): TNormalizedCustomFieldConfig => {
  if (!customFieldConfig) {
    return {};
  }

  const data: Partial<
    Record<TCustomFieldStateKey | TCustomFieldValueKey, string | number | boolean | null>
  > = {};

  for (const [stateKey, valueKey] of customFieldStateValuePairs) {
    if (stateKey in customFieldConfig) {
      const rawState = customFieldConfig[stateKey];
      if (rawState !== undefined) {
        data[stateKey] = rawState;
      }

      if (rawState === false) {
        data[valueKey] = null;
        continue;
      }
    }

    if (valueKey in customFieldConfig) {
      const rawValue = customFieldConfig[valueKey];
      if (rawValue !== undefined) {
        data[valueKey] = rawValue ?? null;
      }
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
  currentSequence: number;
  fixedValueState: boolean;
  fixedValue: string | null;
  fixedPosition: number | null;
  sequenceValueState: boolean;
  sequenceValue: number | null;
  sequenceValuePosition: number | null;
  randomValueState: boolean;
  randomValue: string | null;
  randomValuePosition: number | null;
  datetimeValueState: boolean;
  datetimeValue: string | null;
  datetimeValuePosition: number | null;
}

export const normalizeIdTemplate = (template: TAnyTemplateInput): TNormalizedIdTemplate => {
  const normalized: TNormalizedIdTemplate = {
    currentSequence: template.currentSequence ?? 0,
    fixedValueState: template.fixedValueState ?? false,
    fixedValue: null,
    fixedPosition: null,
    sequenceValueState: template.sequenceValueState ?? false,
    sequenceValue: null,
    sequenceValuePosition: null,
    randomValueState: template.randomValueState ?? false,
    randomValue: null,
    randomValuePosition: null,
    datetimeValueState: template.datetimeValueState ?? false,
    datetimeValue: null,
    datetimeValuePosition: null,
  };

  if (normalized.fixedValueState) {
    normalized.fixedValue = template.fixedValue;
    normalized.fixedPosition = template.fixedPosition;
  }

  if (normalized.sequenceValueState) {
    normalized.sequenceValue = template.sequenceValue;
    normalized.sequenceValuePosition = template.sequenceValuePosition;
  }

  if (normalized.randomValueState) {
    normalized.randomValue = template.randomValue;
    normalized.randomValuePosition = template.randomValuePosition;
  }

  if (normalized.datetimeValueState) {
    normalized.datetimeValue = template.datetimeValue;
    normalized.datetimeValuePosition = template.datetimeValuePosition;
  }

  return normalized;
};
