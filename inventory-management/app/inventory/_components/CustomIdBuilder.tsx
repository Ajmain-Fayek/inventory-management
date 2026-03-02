"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@heroui/button";
import { Select } from "@heroui/select";
import { SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { GripVertical, Trash2, Plus } from "lucide-react";

/* ================= TYPES ================= */

type SegmentType = "fixed" | "random" | "sequence" | "datetime";

type RandomMode = "20bit" | "32bit" | "6digit" | "9digit";

type DateFormat = "yyyy" | "yy" | "yyyyMM" | "yyyyMMdd" | "yyyyMMddHHmm";

type Separator = "_" | "-" | "";

interface Segment {
  id: string;
  type: SegmentType;
  value?: string;
  randomMode?: RandomMode;
  dateFormat?: DateFormat;
  sequenceFormat?: string;
  separator?: Separator;
}

/* ========= GENERATORS ========= */

function generateRandom(mode: RandomMode = "20bit") {
  switch (mode) {
    case "20bit":
      return Math.floor(Math.random() * (1 << 20))
        .toString(16)
        .toUpperCase();
    case "32bit":
      return crypto.getRandomValues(new Uint32Array(1))[0].toString(16).toUpperCase();
    case "6digit":
      return Math.floor(100000 + Math.random() * 900000);
    case "9digit":
      return Math.floor(100000000 + Math.random() * 900000000);
  }
}

function formatDate(format: DateFormat = "yyyy") {
  const now = new Date();
  const yyyy = now.getFullYear();
  const yy = String(yyyy).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const MM = String(now.getMinutes()).padStart(2, "0");

  switch (format) {
    case "yyyy":
      return yyyy;
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

function generateSequence(format: string = "D") {
  const base = 1; // example current number

  if (format === "D_") {
    return `${base}`;
  }

  const match = format.match(/^D([1-9])/);

  if (match) {
    const digits = parseInt(match[1]);
    return `${String(base).padStart(digits, "0")}`;
  }

  return `${base}`;
}

/* ================= COMPONENT ================= */

export default function CustomIdBuilder() {
  const [items, setItems] = useState<Segment[]>([
    { id: "1", type: "fixed", value: "📚-" },
    { id: "2", type: "random", randomMode: "32bit" },
    { id: "3", type: "sequence" },
    { id: "4", type: "datetime", dateFormat: "yyyy" },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  /* ========= DND HANDLERS ========= */

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // Dropped outside builder zone → remove
    if (!over || over.id !== "builder-zone") {
      setItems((prev) => prev.filter((i) => i.id !== active.id));
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }

  /* ========= HELPERS ========= */

  const isUniqueType = (type: SegmentType, id?: string) => {
    if (type === "fixed") return true;

    return !items.some((item) => item.type === type && item.id !== id);
  };

  const updateSegment = (id: string, updates: Partial<Segment>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const addSegment = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "fixed",
        value: "",
      },
    ]);
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

        const separator = index !== items.length - 1 ? (item.separator ?? "") : "";

        return value + separator;
      })
      .join("");
  }, [items]);

  /* ========= TRASH ZONE ========= */

  const TrashZone = () => {
    const { isOver, setNodeRef } = useDroppable({
      id: "builder-zone",
    });

    return (
      <div
        ref={setNodeRef}
        className={`mt-6 border-2 border-dashed rounded-xl p-6 flex justify-center items-center transition 
        ${isOver ? "border-danger bg-danger/10" : "border-default-200"}`}
      >
        {activeId && !isOver && (
          <div className="text-danger text-sm mt-2">Release to remove this segment</div>
        )}

        <Trash2 className="text-danger" />
      </div>
    );
  };

  /* ========= RENDER ========= */

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Preview */}
      <div className="text-xl font-mono tracking-wider bg-content2 p-4 rounded-xl">{preview}</div>

      <Button startContent={<Plus size={16} />} onPress={addSegment} color="primary" variant="flat">
        Add Element
      </Button>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4 bg-amber-400 p-4">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                updateSegment={updateSegment}
                isUniqueType={isUniqueType}
              />
            ))}
          </div>
        </SortableContext>

        <TrashZone />

        <DragOverlay>
          {activeId ? <div className="p-4 bg-content2 rounded-lg shadow-lg">Moving...</div> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/* ================= SORTABLE ITEM ================= */

function SortableItem({ item, updateSegment, isUniqueType }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-content1 rounded-xl shadow-sm flex items-center gap-4"
    >
      <Button {...attributes} {...listeners} isIconOnly variant="light" className="cursor-grab">
        <GripVertical size={18} />
      </Button>

      <Select
        selectedKeys={[item.type]}
        onSelectionChange={(keys) => {
          const newType = Array.from(keys)[0] as SegmentType;
          if (!isUniqueType(newType, item.id)) return;
          updateSegment(item.id, { type: newType });
        }}
        className="w-44"
      >
        <SelectItem key="fixed">Fixed</SelectItem>
        <SelectItem key="random" isDisabled={!isUniqueType("random", item.id)}>
          Random
        </SelectItem>
        <SelectItem key="sequence" isDisabled={!isUniqueType("sequence", item.id)}>
          Sequence
        </SelectItem>
        <SelectItem key="datetime" isDisabled={!isUniqueType("datetime", item.id)}>
          DateTime
        </SelectItem>
      </Select>

      {item.type === "fixed" && (
        <Input
          value={item.value ?? ""}
          onValueChange={(val) => updateSegment(item.id, { value: val })}
          className="flex-1"
        />
      )}

      {item.type === "sequence" && (
        <Input
          value={item.sequenceFormat ?? "D"}
          onValueChange={(val) =>
            updateSegment(item.id, {
              sequenceFormat: val,
            })
          }
          placeholder="D or D4"
          className="flex-1"
        />
      )}

      {item.type === "random" && (
        <Select
          selectedKeys={[item.randomMode ?? "20bit"]}
          onSelectionChange={(keys) =>
            updateSegment(item.id, {
              randomMode: Array.from(keys)[0],
            })
          }
          className="flex-1"
        >
          <SelectItem key="20bit">20-bit</SelectItem>
          <SelectItem key="32bit">32-bit</SelectItem>
          <SelectItem key="6digit">6 Digit</SelectItem>
          <SelectItem key="9digit">9 Digit</SelectItem>
        </Select>
      )}

      {item.type === "datetime" && (
        <Select
          selectedKeys={[item.dateFormat ?? "yyyy"]}
          onSelectionChange={(keys) =>
            updateSegment(item.id, {
              dateFormat: Array.from(keys)[0],
            })
          }
          className="flex-1"
        >
          <SelectItem key="yyyy">Year - {formatDate("yyyy")}</SelectItem>
          <SelectItem key="yy">Short Year - {formatDate("yy")}</SelectItem>
          <SelectItem key="yyyyMM">Year + Month - {formatDate("yyyyMM")}</SelectItem>
          <SelectItem key="yyyyMMdd">Date - {formatDate("yyyyMMdd")}</SelectItem>
          <SelectItem key="yyyyMMddHHmm">Timestamp - {formatDate("yyyyMMddHHmm")}</SelectItem>
        </Select>
      )}

      <Select
        selectedKeys={[item.separator ?? "_"]}
        onSelectionChange={(keys) =>
          updateSegment(item.id, {
            separator: Array.from(keys)[0] as Separator,
          })
        }
        className="w-24"
      >
        <SelectItem key="_">_</SelectItem>
        <SelectItem key="-">-</SelectItem>
        <SelectItem key="">None</SelectItem>
      </Select>
    </div>
  );
}
