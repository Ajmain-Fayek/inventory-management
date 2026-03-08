import { IInventory, ISegment, TSeparator } from "../_interface";

const sep = (s: string | null): TSeparator => (s === "-" ? "-" : "_");

export function inventoryToSegments(inv: IInventory): ISegment[] {
  const tmpl = inv.customIdTemplates;

  // Each enabled segment type has a saved position — restore the correct order.
  type Entry = { seg: ISegment; pos: number };
  const entries: Entry[] = [];

  if (tmpl.fixedValueState)
    entries.push({
      pos: tmpl.fixedPosition ?? 0,
      seg: {
        id: crypto.randomUUID(),
        type: "fixed",
        value: tmpl.fixedValue ?? "📚",
        separator: sep(tmpl.fixedSeparator!),
      },
    });
  if (tmpl.randomValueState)
    entries.push({
      pos: tmpl.randomValuePosition ?? 1,
      seg: {
        id: crypto.randomUUID(),
        type: "random",
        randomMode: (tmpl.randomValue ?? "20bit") as ISegment["randomMode"],
        separator: sep(tmpl.randomSeparator!),
      },
    });
  if (tmpl.sequenceValueState)
    entries.push({
      pos: tmpl.sequenceValuePosition ?? 2,
      seg: {
        id: crypto.randomUUID(),
        type: "sequence",
        sequenceFormat: (tmpl.sequenceValue ?? "D") as ISegment["sequenceFormat"],
        separator: sep(tmpl.sequenceSeparator!),
      },
    });
  if (tmpl.datetimeValueState)
    entries.push({
      pos: tmpl.datetimeValuePosition != null ? Number(tmpl.datetimeValuePosition) : 3,
      seg: {
        id: crypto.randomUUID(),
        type: "datetime",
        dateFormat: (tmpl.datetimeValue ?? "yyyy") as ISegment["dateFormat"],
        separator: sep(tmpl.datetimeSeparator!),
      },
    });

  return entries.sort((a, b) => a.pos - b.pos).map((e) => e.seg);
}
