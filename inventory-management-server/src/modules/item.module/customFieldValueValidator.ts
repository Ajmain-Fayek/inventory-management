import { AppError } from "@/errorHelper/AppError.js";
import status from "http-status";
import { TCreateItemPayload, TUpdateItemPayload } from "./item.validation.js";

type TItemCustomFieldValues =
  | NonNullable<TCreateItemPayload["customFieldValues"]>
  | NonNullable<TUpdateItemPayload["customFieldValues"]>;

export type TMappedItemCustomFieldValues = Partial<{
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
}>;

interface TInventoryFieldState {
  customString1State: boolean;
  customString2State: boolean;
  customString3State: boolean;
  customText1State: boolean;
  customText2State: boolean;
  customText3State: boolean;
  customInt1State: boolean;
  customInt2State: boolean;
  customInt3State: boolean;
  customBool1State: boolean;
  customBool2State: boolean;
  customBool3State: boolean;
}

const shortTextFieldPairs = [
  { stateKey: "customString1State", valueKey: "customString1value" },
  { stateKey: "customString2State", valueKey: "customString2value" },
  { stateKey: "customString3State", valueKey: "customString3value" },
] as const;

const longTextFieldPairs = [
  { stateKey: "customText1State", valueKey: "customText1value" },
  { stateKey: "customText2State", valueKey: "customText2value" },
  { stateKey: "customText3State", valueKey: "customText3value" },
] as const;

const intFieldPairs = [
  { stateKey: "customInt1State", valueKey: "customInt1value" },
  { stateKey: "customInt2State", valueKey: "customInt2value" },
  { stateKey: "customInt3State", valueKey: "customInt3value" },
] as const;

const boolFieldPairs = [
  { stateKey: "customBool1State", valueKey: "customBool1value" },
  { stateKey: "customBool2State", valueKey: "customBool2value" },
  { stateKey: "customBool3State", valueKey: "customBool3value" },
] as const;

const hasOwnField = <T extends object>(target: T, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(target, key);

export const validateAndMapCustomFieldValues = (
  inventory: TInventoryFieldState,
  payloadValues?: TItemCustomFieldValues,
): TMappedItemCustomFieldValues => {
  if (!payloadValues || Object.keys(payloadValues).length === 0) {
    return {};
  }

  const mappedValues: TMappedItemCustomFieldValues = {};

  for (const pair of shortTextFieldPairs) {
    if (!hasOwnField(payloadValues, pair.valueKey)) {
      continue;
    }

    if (!inventory[pair.stateKey]) {
      throw new AppError(`${pair.valueKey} is disabled for this inventory`, status.BAD_REQUEST);
    }

    const value = payloadValues[pair.valueKey];
    mappedValues[pair.valueKey] = value ?? null;
  }

  for (const pair of longTextFieldPairs) {
    if (!hasOwnField(payloadValues, pair.valueKey)) {
      continue;
    }

    if (!inventory[pair.stateKey]) {
      throw new AppError(`${pair.valueKey} is disabled for this inventory`, status.BAD_REQUEST);
    }

    const value = payloadValues[pair.valueKey];
    mappedValues[pair.valueKey] = value ?? null;
  }

  for (const pair of intFieldPairs) {
    if (!hasOwnField(payloadValues, pair.valueKey)) {
      continue;
    }

    if (!inventory[pair.stateKey]) {
      throw new AppError(`${pair.valueKey} is disabled for this inventory`, status.BAD_REQUEST);
    }

    const value = payloadValues[pair.valueKey];
    mappedValues[pair.valueKey] = value ?? null;
  }

  for (const pair of boolFieldPairs) {
    if (!hasOwnField(payloadValues, pair.valueKey)) {
      continue;
    }

    if (!inventory[pair.stateKey]) {
      throw new AppError(`${pair.valueKey} is disabled for this inventory`, status.BAD_REQUEST);
    }

    const value = payloadValues[pair.valueKey];
    mappedValues[pair.valueKey] = value ?? null;
  }

  return mappedValues;
};
