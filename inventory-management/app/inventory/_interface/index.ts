export type TCustomFieldType = "String" | "Text" | "Int" | "Bool";
export type TCustomFieldIndex = 1 | 2 | 3;
export type TShowInTableKey = `custom${TCustomFieldType}${TCustomFieldIndex}ShowInTable`;
export type TCustomStateKey = `custom${TCustomFieldType}${TCustomFieldIndex}State`;
export type TCustomValueKey = `custom${TCustomFieldType}${TCustomFieldIndex}Value`;
export type TCustomValueKeyPair = [TCustomValueKey, string, TCustomFieldType, boolean];
export type TDateFormat = "yyyy" | "yy" | "yyyyMM" | "yyyyMMdd" | "yyyyMMddHHmm";
export type TSegmentType = "fixed" | "random" | "sequence" | "datetime";
export type TRandomMode = "20bit" | "32bit" | "6digit" | "9digit";
export type TSeparator = "_" | "-";
export type TSaveStatus = "idle" | "editing" | "countdown" | "saving" | "saved" | "error";

export const UNIQUE_TYPES: TSegmentType[] = ["random", "sequence", "datetime"];
export const CUSTOM_FIELD_CONFIG = [
  { type: "String", prefix: "customString" },
  { type: "Text", prefix: "customText" },
  { type: "Int", prefix: "customInt" },
  { type: "Bool", prefix: "customBool" },
] as const;
export const EMPTY_CUSTOM_FIELDS: ICustomFieldsState = {
  String: [],
  Text: [],
  Int: [],
  Bool: [],
};

export interface ISegment {
  id: string;
  type: TSegmentType;
  value?: string;
  randomMode?: TRandomMode;
  dateFormat?: TDateFormat;
  sequenceFormat?: string;
  separator?: TSeparator;
}

export interface ICustomIdTemplateValues {
  fixedValueState: boolean;
  fixedValue?: string | null;
  fixedPosition?: number | null;
  fixedSeparator?: string | null;

  sequenceValueState: boolean;
  sequenceValue?: string | null;
  sequenceValuePosition?: number | null;
  sequenceSeparator?: string | null;

  randomValueState: boolean;
  randomValue?: string | null;
  randomValuePosition?: number | null;
  randomSeparator?: string | null;

  datetimeValueState: boolean;
  datetimeValue?: string | null;
  datetimeValuePosition?: number | null;
  datetimeSeparator?: string | null;
}

export interface ICustomField {
  id: string;
  type: TCustomFieldType;
  name: string;
  showInTable: boolean;
}

export interface ICustomFieldsState {
  String: ICustomField[];
  Text: ICustomField[];
  Int: ICustomField[];
  Bool: ICustomField[];
}

export interface IInventory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  quantity: number;
  categoryName: string;
  creator: string;
  creatorId: string;
  isPublic: boolean;
  isInEditMode: boolean;
  editingUserId: string | null;
  version: number;
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
  createdAt: string;
  updatedAt: string;
  inventoryTags: string[];
  writeAccess: IWriteAccess[];
  customIdTemplates: Partial<IIdTemplate>;
}

export interface IWriteAccess {
  id: string;
  name: string;
  email: string;
}

export interface IIdTemplate {
  id: string;
  inventoryId: string;
  version: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface IItem {
  id: string;
  inventoryId: string;
  inventoryTitle: string;
  isInEditMode: boolean;
  editingUserId: string | null;
  version: number;
  customString1value: string | null;
  customString2value: string | null;
  customString3value: string | null;
  customText1value: string | null;
  customText2value: string | null;
  customText3value: string | null;
  customInt1value: number | null;
  customInt2value: number | null;
  customInt3value: number | null;
  customBool1value: boolean | null;
  customBool2value: boolean | null;
  customBool3value: boolean | null;
  createdAt: string;
  updatedAt: string;
  customId: string;

  [key: string]: string | number | boolean | null;
}

export interface ICustomIdValue {
  id: string;
  itemId: string;
  version: number;
  fixedValue: string | null;
  sequenceValue: number | null;
  randomValue: string | null;
  datetimeValue: string | null;
  createdAt: string;
  updatedAt: string;
}
