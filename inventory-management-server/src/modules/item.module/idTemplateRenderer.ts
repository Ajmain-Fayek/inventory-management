import { randomBytes } from "node:crypto";
import { AppError } from "@/errorHelper/AppError.js";
import status from "http-status";

export interface TRenderableIdTemplate {
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

export interface TStoredCustomIdValue {
  fixedValue: string | null;
  sequenceValue: number | null;
  randomValue: string | null;
  datetimeValue: string | null;
}

export type TRenderedCustomId = TStoredCustomIdValue & {
  customId: string;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toPadded = (value: number | bigint, length: number) => value.toString().padStart(length, "0");

const randomBigInt = (maxExclusive: bigint) => {
  if (maxExclusive <= 1n) {
    return 0n;
  }

  const bitLength = maxExclusive.toString(2).length;
  const byteLength = Math.ceil(bitLength / 8);
  const mask = (1n << BigInt(bitLength)) - 1n;

  while (true) {
    const bytes = randomBytes(byteLength);
    let randomValue = 0n;

    for (const byte of bytes) {
      randomValue = (randomValue << 8n) | BigInt(byte);
    }

    randomValue &= mask;

    if (randomValue < maxExclusive) {
      return randomValue;
    }
  }
};

const formatRandomPart = (format: string) => {
  const bitMatch = /^BIT(\d+)$/i.exec(format);
  if (bitMatch) {
    const bitSize = Number(bitMatch[1]);

    if (!Number.isInteger(bitSize) || bitSize < 1 || bitSize > 64) {
      throw new AppError(`Invalid RANDOM format '${format}'`, status.BAD_REQUEST);
    }

    const value = randomBigInt(1n << BigInt(bitSize));
    return value.toString();
  }

  const decimalMatch = /^D(\d+)$/i.exec(format);
  if (decimalMatch) {
    const digitSize = Number(decimalMatch[1]);

    if (!Number.isInteger(digitSize) || digitSize < 1 || digitSize > 18) {
      throw new AppError(`Invalid RANDOM format '${format}'`, status.BAD_REQUEST);
    }

    const maxExclusive = 10n ** BigInt(digitSize);
    const value = randomBigInt(maxExclusive);
    return value.toString().padStart(digitSize, "0");
  }

  const hexMatch = /^X(\d+)$/i.exec(format);
  if (hexMatch) {
    const hexSize = Number(hexMatch[1]);

    if (!Number.isInteger(hexSize) || hexSize < 1 || hexSize > 16) {
      throw new AppError(`Invalid RANDOM format '${format}'`, status.BAD_REQUEST);
    }

    const maxExclusive = 16n ** BigInt(hexSize);
    const value = randomBigInt(maxExclusive);
    return value.toString(16).toUpperCase().padStart(hexSize, "0");
  }

  throw new AppError(`Invalid RANDOM format '${format}'`, status.BAD_REQUEST);
};

const validateDateFormat = (format: string) => {
  const withoutKnownTokens = format.replace(/yyyy|yy|MM|dd|HH|mm|ss|ddd/g, "");

  if (/[A-Za-z]/.test(withoutKnownTokens)) {
    throw new AppError(`Invalid DATETIME format '${format}'`, status.BAD_REQUEST);
  }
};

const formatDatePart = (date: Date, format: string) => {
  validateDateFormat(format);

  const tokens: Record<string, string> = {
    yyyy: date.getUTCFullYear().toString(),
    yy: toPadded(date.getUTCFullYear() % 100, 2),
    MM: toPadded(date.getUTCMonth() + 1, 2),
    dd: toPadded(date.getUTCDate(), 2),
    HH: toPadded(date.getUTCHours(), 2),
    mm: toPadded(date.getUTCMinutes(), 2),
    ss: toPadded(date.getUTCSeconds(), 2),
    ddd: DAY_NAMES[date.getUTCDay()] ?? "",
  };

  return format.replace(/yyyy|yy|MM|dd|HH|mm|ss|ddd/g, (token) => tokens[token] ?? token);
};

const formatSequencePart = (sequenceValue: number, paddingDigits: number | null) => {
  if (!paddingDigits || paddingDigits < 1) {
    return sequenceValue.toString();
  }

  if (paddingDigits > 18) {
    throw new AppError("Invalid SEQUENCE padding value", status.BAD_REQUEST);
  }

  return sequenceValue.toString().padStart(paddingDigits, "0");
};

const fallbackCompose = (value: TStoredCustomIdValue) => {
  const fallbackParts: string[] = [];

  if (value.fixedValue) {
    fallbackParts.push(value.fixedValue);
  }

  if (value.sequenceValue !== null) {
    fallbackParts.push(value.sequenceValue.toString());
  }

  if (value.randomValue) {
    fallbackParts.push(value.randomValue);
  }

  if (value.datetimeValue) {
    fallbackParts.push(value.datetimeValue);
  }

  return fallbackParts.join("");
};

export const renderCustomIdFromTemplate = (
  template: TRenderableIdTemplate,
  sequenceCounter: number,
  createdAt: Date,
): TRenderedCustomId => {
  const pieces: { position: number; value: string }[] = [];

  let fixedValue: string | null = null;
  let sequenceValue: number | null = null;
  let randomValue: string | null = null;
  let datetimeValue: string | null = null;

  if (template.fixedValueState) {
    if (template.fixedValue === null || template.fixedPosition === null) {
      throw new AppError("Invalid FIXED template configuration", status.BAD_REQUEST);
    }

    fixedValue = template.fixedValue;
    pieces.push({
      position: template.fixedPosition,
      value: fixedValue,
    });
  }

  if (template.sequenceValueState) {
    if (template.sequenceValuePosition === null) {
      throw new AppError("Invalid SEQUENCE template configuration", status.BAD_REQUEST);
    }

    sequenceValue = sequenceCounter;
    pieces.push({
      position: template.sequenceValuePosition,
      value: formatSequencePart(sequenceCounter, template.sequenceValue),
    });
  }

  if (template.randomValueState) {
    if (template.randomValue === null || template.randomValuePosition === null) {
      throw new AppError("Invalid RANDOM template configuration", status.BAD_REQUEST);
    }

    randomValue = formatRandomPart(template.randomValue);
    pieces.push({
      position: template.randomValuePosition,
      value: randomValue,
    });
  }

  if (template.datetimeValueState) {
    if (template.datetimeValue === null || template.datetimeValuePosition === null) {
      throw new AppError("Invalid DATETIME template configuration", status.BAD_REQUEST);
    }

    datetimeValue = formatDatePart(createdAt, template.datetimeValue);
    pieces.push({
      position: template.datetimeValuePosition,
      value: datetimeValue,
    });
  }

  pieces.sort((a, b) => a.position - b.position);

  return {
    customId: pieces.map((part) => part.value).join(""),
    fixedValue,
    sequenceValue,
    randomValue,
    datetimeValue,
  };
};

export const composeCustomIdFromStoredValue = (
  template: TRenderableIdTemplate | null,
  value: TStoredCustomIdValue | null,
) => {
  if (!value) {
    return null;
  }

  if (!template) {
    const fallbackCustomId = fallbackCompose(value);
    return fallbackCustomId || null;
  }

  const pieces: { position: number; value: string }[] = [];

  if (template.fixedValueState && template.fixedPosition !== null && value.fixedValue) {
    pieces.push({
      position: template.fixedPosition,
      value: value.fixedValue,
    });
  }

  if (
    template.sequenceValueState &&
    template.sequenceValuePosition !== null &&
    value.sequenceValue !== null
  ) {
    pieces.push({
      position: template.sequenceValuePosition,
      value: formatSequencePart(value.sequenceValue, template.sequenceValue),
    });
  }

  if (template.randomValueState && template.randomValuePosition !== null && value.randomValue) {
    pieces.push({
      position: template.randomValuePosition,
      value: value.randomValue,
    });
  }

  if (template.datetimeValueState && template.datetimeValuePosition !== null && value.datetimeValue) {
    pieces.push({
      position: template.datetimeValuePosition,
      value: value.datetimeValue,
    });
  }

  if (pieces.length === 0) {
    const fallbackCustomId = fallbackCompose(value);
    return fallbackCustomId || null;
  }

  pieces.sort((a, b) => a.position - b.position);
  return pieces.map((part) => part.value).join("");
};
