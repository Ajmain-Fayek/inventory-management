"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { GripVertical, Plus, AlertTriangle } from "lucide-react";

/* ================= TYPES ================= */

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

export interface CustomIdValues {
  currentSequence?: number | null;

  fixedValueState: boolean;
  fixedValue?: string | null;
  fixedPosition?: number | null;

  sequenceValueState: boolean;
  sequenceValue?: number | null;
  sequenceValuePosition?: number | null;

  randomValueState: boolean;
  randomValue?: string | null;
  randomValuePosition?: number | null;

  datetimeValueState: boolean;
  datetimeValue?: string | null;
  datetimeValuePosition?: number | null;
}

interface CustomIdBuilderProps {
  /** Controlled segment list — lives in the parent to survive tab switches */
  items: Segment[];
  onItemsChange: (items: Segment[]) => void;
  onChange?: (values: CustomIdValues) => void;
}

/* ========= GENERATORS ========= */

function generateRandom(mode: RandomMode = "20bit"): string {
  switch (mode) {
    case "20bit":
      return Math.floor(Math.random() * (1 << 20))
        .toString(16)
        .toUpperCase();
    case "32bit":
      return crypto.getRandomValues(new Uint32Array(1))[0].toString(16).toUpperCase();
    case "6digit":
      return String(Math.floor(100000 + Math.random() * 900000));
    case "9digit":
      return String(Math.floor(100000000 + Math.random() * 900000000));
  }
}

function formatDate(format: DateFormat = "yyyy"): string {
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

function generateSequence(format: string = "D"): string {
  const base = 1;
  if (format === "D_") return `${base}`;
  const match = format.match(/^D([1-9])/);
  if (match) {
    const digits = parseInt(match[1]);
    return String(base).padStart(digits, "0");
  }
  return `${base}`;
}

/* ================= MAIN COMPONENT ================= */

const MAX_ITEMS = 4;

export default function CustomIdBuilder({ items, onItemsChange, onChange }: CustomIdBuilderProps) {
  // items is fully controlled by parent — no local state here
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverDelete, setIsOverDelete] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  // Track whether the dragged item is currently outside the builder zone
  const pointerOutside = useRef(false);

  const formRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  /* ========= DERIVED DATA ========= */

  const existingTypes = useMemo(() => new Set(items.map((i) => i.type)), [items]);

  const isUniqueType = (type: SegmentType, excludeId?: string): boolean => {
    if (type === "fixed") return true;
    return !items.some((item) => item.type === type && item.id !== excludeId);
  };

  /* ========= DND HANDLERS ========= */

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
    setIsDragging(true);
    pointerOutside.current = false;
  }

  function handleDragMove(event: DragMoveEvent) {
    if (!formRef.current) return;
    const rect = formRef.current.getBoundingClientRect();
    // activatorEvent holds the original native pointer event
    const nativeEvent = event.activatorEvent as PointerEvent;
    // The current pointer position = original position + cumulative delta
    const x = nativeEvent.clientX + event.delta.x;
    const y = nativeEvent.clientY + event.delta.y;
    const outside = x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
    pointerOutside.current = outside;
    setIsOverDelete(outside);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const wasOutside = pointerOutside.current;

    setIsDragging(false);
    setIsOverDelete(false);
    setActiveId(null);
    pointerOutside.current = false;

    // If pointer ended outside the builder container -> remove
    if (wasOutside) {
      onItemsChange(items.filter((i) => i.id !== String(active.id)));
      return;
    }

    // Reordering within list
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === String(active.id));
      const newIndex = items.findIndex((i) => i.id === String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        onItemsChange(arrayMove(items, oldIndex, newIndex));
      }
    }
  }

  /* ========= TRACK POINTER OVER DELETE ZONE (visuals only) ========= */

  useEffect(() => {
    if (!isDragging) {
      setIsOverDelete(false);
    }
  }, [isDragging]);

  /* ========= HELPERS ========= */

  const updateSegment = (id: string, updates: Partial<Segment>) => {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeSegment = (id: string) => {
    onItemsChange(items.filter((i) => i.id !== id));
  };

  const addSegment = () => {
    if (items.length >= MAX_ITEMS) return;
    const newSeg: Segment = {
      id: crypto.randomUUID(),
      type: "fixed",
      value: "",
      separator: "_",
    };
    onItemsChange([...items, newSeg]);
    setDuplicateWarning(null);
  };

  const handleTypeChange = (id: string, newType: SegmentType) => {
    if (newType !== "fixed" && !isUniqueType(newType, id)) {
      setDuplicateWarning(
        `"${newType.charAt(0).toUpperCase() + newType.slice(1)}" type is already added. Each type (except Fixed) can only be used once.`,
      );
      return;
    }
    setDuplicateWarning(null);
    // Write explicit defaults so HeroUI Select always has a concrete selectedKey
    const defaults: Partial<Segment> =
      newType === "random"
        ? { type: newType, randomMode: "20bit" }
        : newType === "datetime"
          ? { type: newType, dateFormat: "yyyy" }
          : newType === "sequence"
            ? { type: newType, sequenceFormat: "D" }
            : { type: newType, value: "" };
    updateSegment(id, defaults);
  };

  /* ========= PREVIEW ========= */

  const preview = useMemo(() => {
    return items
      .map((item, index) => {
        let value = "";
        switch (item.type) {
          case "fixed":
            value = item.value ?? "";
            break;
          case "random":
            value = generateRandom(item.randomMode);
            break;
          case "sequence":
            value = generateSequence(item.sequenceFormat);
            break;
          case "datetime":
            value = formatDate(item.dateFormat);
            break;
        }
        const separator = index !== items.length - 1 ? (item.separator ?? "_") : "";
        return value + separator;
      })
      .join("");
  }, [items]);

  /* ========= DERIVED VALUES FOR onChange ========= */

  useEffect(() => {
    if (!onChange) return;

    const fixedItem = items.find((i) => i.type === "fixed");
    const sequenceItem = items.find((i) => i.type === "sequence");
    const randomItem = items.find((i) => i.type === "random");
    const datetimeItem = items.find((i) => i.type === "datetime");

    const values: CustomIdValues = {
      currentSequence: sequenceItem
        ? parseInt(generateSequence(sequenceItem.sequenceFormat))
        : null,

      fixedValueState: !!fixedItem,
      fixedValue: fixedItem?.value ?? null,
      fixedPosition: fixedItem ? items.indexOf(fixedItem) : null,

      sequenceValueState: !!sequenceItem,
      sequenceValue: sequenceItem ? parseInt(generateSequence(sequenceItem.sequenceFormat)) : null,
      sequenceValuePosition: sequenceItem ? items.indexOf(sequenceItem) : null,

      randomValueState: !!randomItem,
      randomValue: randomItem?.randomMode ?? null,
      randomValuePosition: randomItem ? items.indexOf(randomItem) : null,

      datetimeValueState: !!datetimeItem,
      datetimeValue: datetimeItem?.dateFormat ?? null,
      datetimeValuePosition: datetimeItem ? items.indexOf(datetimeItem) : null,
    };

    onChange(values);
  }, [items, onChange]);

  /* ========= RENDER ========= */

  const atMax = items.length >= MAX_ITEMS;

  return (
    <div className="max-w-4xl mx-auto space-y-4" ref={formRef}>
      {/* Preview */}
      <div className="text-xl font-mono tracking-wider bg-content2 p-4 rounded-xl break-all">
        {preview || <span className="text-default-400 text-sm">No elements added yet</span>}
      </div>

      {/* Add Element Button */}
      <div className="flex items-center gap-3">
        <Button
          startContent={<Plus size={16} />}
          onPress={addSegment}
          color="primary"
          variant="flat"
          isDisabled={atMax}
        >
          Add Element
        </Button>
        {atMax && (
          <span className="text-sm text-default-400">Maximum {MAX_ITEMS} elements reached</span>
        )}
      </div>

      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="flex items-center gap-2 bg-warning-50 border border-warning-200 text-warning-700 rounded-lg px-4 py-2 text-sm">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{duplicateWarning}</span>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        {/* Builder Zone (Active / Blue highlight when dragging) */}
        <div
          className={`rounded-xl border-2 p-4 space-y-3 transition-colors duration-200 ${
            isDragging
              ? "border-primary bg-primary/5 border-solid"
              : "border-dashed border-default-200"
          }`}
        >
          {isDragging && (
            <p className="text-xs text-primary text-center font-medium">
              Drop here to reorder · Drag outside to remove
            </p>
          )}

          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                index={index}
                updateSegment={updateSegment}
                onTypeChange={handleTypeChange}
                onRemove={removeSegment}
                isUniqueType={isUniqueType}
              />
            ))}
          </SortableContext>

          {items.length === 0 && (
            <div className="py-8 text-center text-default-400 text-sm">
              No elements. Click &quot;Add Element&quot; to begin.
            </div>
          )}
        </div>

        {/* Delete Zone (Red — always visible, highlights when dragging outside) */}
        {isDragging && (
          <div
            className={`mt-3 rounded-xl border-2 border-dashed p-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-200 ${
              isOverDelete
                ? "border-danger bg-danger/15 text-danger"
                : "border-danger/40 bg-danger/5 text-danger/60"
            }`}
          >
            <span>🗑</span>
            <span>Drag outside the blue area to remove</span>
          </div>
        )}

        <DragOverlay>
          {activeId ? (
            <div className="p-3 bg-content2 border border-primary rounded-lg shadow-xl opacity-90 text-sm font-medium text-primary">
              Moving segment…
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/* ================= SORTABLE ITEM ================= */

interface SortableItemProps {
  item: Segment;
  index: number;
  updateSegment: (id: string, updates: Partial<Segment>) => void;
  onTypeChange: (id: string, type: SegmentType) => void;
  onRemove: (id: string) => void;
  isUniqueType: (type: SegmentType, excludeId?: string) => boolean;
}

function SortableItem({
  item,
  updateSegment,
  onTypeChange,
  onRemove,
  isUniqueType,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 bg-content1 rounded-xl shadow-sm flex items-center gap-3 border border-default-100"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing text-default-400 hover:text-default-700 transition-colors p-1 rounded"
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>

      {/* Type Selector */}
      <Select
        selectedKeys={[item.type]}
        onSelectionChange={(keys) => {
          const newType = Array.from(keys)[0] as SegmentType;
          if (newType) onTypeChange(item.id, newType);
        }}
        className="w-40 shrink-0"
        size="sm"
        aria-label="Segment type"
      >
        <SelectItem key="fixed">Fixed</SelectItem>
        <SelectItem
          key="random"
          isReadOnly={!isUniqueType("random", item.id)}
          className={`${!isUniqueType("random", item.id) ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          Random
        </SelectItem>
        <SelectItem
          key="sequence"
          isReadOnly={!isUniqueType("sequence", item.id)}
          className={`${!isUniqueType("sequence", item.id) ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          Sequence
        </SelectItem>
        <SelectItem
          key="datetime"
          isReadOnly={!isUniqueType("datetime", item.id)}
          className={`${!isUniqueType("datetime", item.id) ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          DateTime
        </SelectItem>
      </Select>

      {/* Type-specific controls */}
      {item.type === "fixed" && (
        <Input
          value={item.value ?? ""}
          onValueChange={(val) => updateSegment(item.id, { value: val })}
          className="flex-1"
          size="sm"
          placeholder="Fixed text…"
          aria-label="Fixed value"
        />
      )}

      {item.type === "sequence" && (
        <Input
          value={item.sequenceFormat ?? "D"}
          onValueChange={(val) => {
            // Always keep the "D" prefix; allow at most one digit 1-9 after it
            if (val === "D" || val === "") {
              updateSegment(item.id, { sequenceFormat: "D" });
              return;
            }
            if (/^D[1-9]$/.test(val)) {
              updateSegment(item.id, { sequenceFormat: val });
              return;
            }
            // Block anything else (don't update)
          }}
          onKeyDown={(e) => {
            const current = item.sequenceFormat ?? "D";
            // Prevent deleting the "D"
            if ((e.key === "Backspace" || e.key === "Delete") && current === "D") {
              e.preventDefault();
            }
          }}
          placeholder="D or D1–D9"
          description="D = no padding, D4 = 4-digit padding"
          className="flex-1"
          size="sm"
          aria-label="Sequence format"
        />
      )}

      {item.type === "random" && (
        <Select
          selectedKeys={[item.randomMode ?? "20bit"]}
          onSelectionChange={(keys) =>
            updateSegment(item.id, {
              randomMode: Array.from(keys)[0] as RandomMode,
            })
          }
          className="flex-1"
          size="sm"
          aria-label="Random mode"
        >
          <SelectItem key="20bit">20-bit Hex</SelectItem>
          <SelectItem key="32bit">32-bit Hex</SelectItem>
          <SelectItem key="6digit">6 Digit</SelectItem>
          <SelectItem key="9digit">9 Digit</SelectItem>
        </Select>
      )}

      {item.type === "datetime" && (
        <Select
          selectedKeys={[item.dateFormat ?? "yyyy"]}
          onSelectionChange={(keys) =>
            updateSegment(item.id, {
              dateFormat: Array.from(keys)[0] as DateFormat,
            })
          }
          className="flex-1"
          size="sm"
          aria-label="Date format"
        >
          <SelectItem key="yyyy" textValue={`Year — ${formatDate("yyyy")}`}>
            Year — {formatDate("yyyy")}
          </SelectItem>
          <SelectItem key="yy" textValue={`Short Year — ${formatDate("yy")}`}>
            Short Year — {formatDate("yy")}
          </SelectItem>
          <SelectItem key="yyyyMM" textValue={`Year + Month — ${formatDate("yyyyMM")}`}>
            Year + Month — {formatDate("yyyyMM")}
          </SelectItem>
          <SelectItem key="yyyyMMdd" textValue={`Date — ${formatDate("yyyyMMdd")}`}>
            Date — {formatDate("yyyyMMdd")}
          </SelectItem>
          <SelectItem key="yyyyMMddHHmm" textValue={`Timestamp — ${formatDate("yyyyMMddHHmm")}`}>
            Timestamp — {formatDate("yyyyMMddHHmm")}
          </SelectItem>
        </Select>
      )}

      {/* Separator */}
      <Select
        selectedKeys={[item.separator ?? "_"]}
        onSelectionChange={(keys) =>
          updateSegment(item.id, {
            separator: Array.from(keys)[0] as Separator,
          })
        }
        className="w-24 shrink-0"
        size="sm"
        aria-label="Separator"
        label="Sep"
        labelPlacement="outside-left"
      >
        <SelectItem key="_">_</SelectItem>
        <SelectItem key="-">-</SelectItem>
      </Select>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="text-danger/60 hover:text-danger transition-colors p-1 rounded shrink-0"
        aria-label="Remove segment"
      >
        ✕
      </button>
    </div>
  );
}
