export interface TRenderableIdTemplate {
  fixedValue: string | null;
  sequenceValue: string | null;
  randomValue: string | null;
  datetimeValue: string | null;
  fixedValueState: boolean;
  fixedPosition: number | null;
  fixedSeparator: string | null;
  sequenceValueState: boolean;
  sequenceValuePosition: number | null;
  sequenceSeparator: string | null;
  randomValueState: boolean;
  randomValuePosition: number | null;
  randomSeparator: string | null;
  datetimeValueState: boolean;
  datetimeValuePosition: number | null;
  datetimeSeparator: string | null;
}

export interface TStoredCustomIdValue {
  fixedValue: string | null;
  sequenceValue: number | null;
  randomValue: string | null;
  datetimeValue: string | null;
}

type SegmentType = "fixed" | "random" | "sequence" | "datetime";
type RandomMode = "20bit" | "32bit" | "6digit" | "9digit";
type DateFormat = "yyyy" | "yy" | "yyyyMM" | "yyyyMMdd" | "yyyyMMddHHmm";
type Separator = "_" | "-";

export interface Segment {
  id: string;
  type: SegmentType;
  value?: string;
  randomMode?: RandomMode;
  dateFormat?: DateFormat;
  sequenceFormat?: string;
  separator?: Separator;
}

export function generateRandom(mode: RandomMode = "20bit"): string {
  switch (mode) {
    case "20bit":
      return Math.floor(Math.random() * (1 << 20))
        .toString(16)
        .toUpperCase();
    case "32bit":
      return crypto.getRandomValues(new Uint32Array(1))[0]!.toString(16).toUpperCase();
    case "6digit":
      return String(Math.floor(100000 + Math.random() * 900000));
    case "9digit":
      return String(Math.floor(100000000 + Math.random() * 900000000));
  }
}

export function formatDate(format: DateFormat = "yyyy"): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const yy = String(yyyy).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const MM = String(now.getMinutes()).padStart(2, "0");

  switch (format) {
    case "yyyy":
      return String(yyyy);
    case "yy":
      return yy;
    case "yyyyMM":
      return `${yyyy}${mm}`;
    case "yyyyMMdd":
      return `${yyyy}${mm}${dd}`;
    case "yyyyMMddHHmm":
      return `${yyyy}${mm}${dd}${HH}${MM}`;
  }
}

export function generateSequence(format = "D"): string {
  const base = 1;
  if (format === "D") return `${base}`;
  const match = format.match(/^D([1-9])/);
  if (match) {
    const digits = parseInt(match[1]!);
    return String(base).padStart(digits, "0");
  }
  return `${base}`;
}

type LastCreatedId = {
  sequenceValue: number | null;
} | null;

export function buildCustomIdValuePayload(
  inventoryId: string,
  template: TRenderableIdTemplate,
  lastCreatedId: LastCreatedId,
) {
  const payload: {
    inventoryId: string;
    fixedValue?: string | null;
    sequenceValue?: number | null;
    randomValue?: string | null;
    datetimeValue?: string | null;
  } = { inventoryId };

  if (template.fixedValueState) {
    payload.fixedValue = template.fixedValue ?? null;
  }

  if (template.sequenceValueState) {
    const nextSequence = (lastCreatedId?.sequenceValue ?? 0) + 1;
    payload.sequenceValue = nextSequence;
  }

  if (template.randomValueState) {
    payload.randomValue = generateRandom((template.randomValue as RandomMode) ?? "20bit");
  }

  if (template.datetimeValueState) {
    payload.datetimeValue = formatDate((template.datetimeValue as DateFormat) ?? "yyyy");
  }

  return payload;
}

function formatSequence(value: number | null, format: string | null) {
  if (value === null) return "";

  if (!format || format === "D") return String(value);

  const match = format.match(/^D([1-9])/);

  if (match) {
    const digits = parseInt(match[1]!);
    return String(value).padStart(digits, "0");
  }

  return String(value);
}

export function assembleCustomId(
  template: TRenderableIdTemplate,
  values: TStoredCustomIdValue,
): string {
  const segments: {
    position: number;
    value: string;
    separator: string;
  }[] = [];

  if (template.fixedValueState && values.fixedValue) {
    segments.push({
      position: template.fixedPosition ?? 0,
      value: values.fixedValue,
      separator: template.fixedSeparator ?? "_",
    });
  }

  if (template.sequenceValueState && values.sequenceValue) {
    segments.push({
      position: template.sequenceValuePosition ?? 0,
      value: formatSequence(values.sequenceValue, template.sequenceValue),
      separator: template.sequenceSeparator ?? "_",
    });
  }

  if (template.randomValueState && values.randomValue) {
    segments.push({
      position: template.randomValuePosition ?? 0,
      value: values.randomValue,
      separator: template.randomSeparator ?? "_",
    });
  }

  if (template.datetimeValueState && values.datetimeValue) {
    segments.push({
      position: template.datetimeValuePosition ?? 0,
      value: values.datetimeValue,
      separator: template.datetimeSeparator ?? "_",
    });
  }

  segments.sort((a, b) => a.position - b.position);

  let customId = "";

  segments.forEach((segment, index) => {
    if (index === 0) {
      customId += segment.value;
    } else {
      customId += segment.separator + segment.value;
    }
  });

  return customId;
}
