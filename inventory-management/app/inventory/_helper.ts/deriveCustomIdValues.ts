import { IIdTemplate, ISegment } from "../_interface";

/**
 * Derive CustomIdValues from the ordered items array.
 * This mirrors what CustomIdBuilder computes in its internal onChange effect,
 * so the payload is always consistent — regardless of whether the tab has
 * been visited (i.e., CustomIdBuilder has mounted) or not.
 */
export function deriveCustomIdValues(
  items: ISegment[],
  version?: number,
): Omit<IIdTemplate, "id" | "inventoryId" | "createdAt" | "updatedAt"> {
  const fixedItem = items.find((i) => i.type === "fixed");
  const sequenceItem = items.find((i) => i.type === "sequence");
  const randomItem = items.find((i) => i.type === "random");
  const datetimeItem = items.find((i) => i.type === "datetime");

  return {
    version: version ? version + 1 : 1,
    fixedValueState: !!fixedItem,
    fixedValue: fixedItem?.value ?? null,
    fixedPosition: fixedItem ? items.indexOf(fixedItem) : null,
    fixedSeparator: fixedItem?.separator ?? null,
    sequenceValueState: !!sequenceItem,
    sequenceValue: sequenceItem?.sequenceFormat ?? null,
    sequenceValuePosition: sequenceItem ? items.indexOf(sequenceItem) : null,
    sequenceSeparator: sequenceItem?.separator ?? null,
    randomValueState: !!randomItem,
    randomValue: randomItem?.randomMode ?? null,
    randomValuePosition: randomItem ? items.indexOf(randomItem) : null,
    randomSeparator: randomItem?.separator ?? null,
    datetimeValueState: !!datetimeItem,
    datetimeValue: datetimeItem?.dateFormat ?? null,
    datetimeValuePosition: datetimeItem ? items.indexOf(datetimeItem) : null,
    datetimeSeparator: datetimeItem?.separator ?? null,
  };
}
