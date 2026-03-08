"use client";

import { AlignLeft, AlignJustify, Hash, ToggleLeft, Plus, Trash2 } from "lucide-react";
import { ICustomField, ICustomFieldsState, TCustomFieldType } from "../_interface";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Switch } from "@heroui/switch";

/* ================= TYPES ================= */

interface CustomFieldsBuilderProps {
  fields: ICustomFieldsState;
  onFieldsChange: (fields: ICustomFieldsState) => void;
}

/* ================= CONFIG ================= */

const MAX_PER_TYPE = 3;

const TYPE_CONFIG: {
  key: TCustomFieldType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badgeColor: "primary" | "success" | "warning" | "secondary";
}[] = [
  {
    key: "String",
    label: "Single-line Text",
    description: "Short values like names, codes, or labels",
    icon: <AlignLeft size={16} />,
    color: "bg-primary/8 border-primary/20",
    badgeColor: "primary",
  },
  {
    key: "Text",
    label: "Multi-line Text",
    description: "Longer descriptions or notes",
    icon: <AlignJustify size={16} />,
    color: "bg-secondary/8 border-secondary/20",
    badgeColor: "secondary",
  },
  {
    key: "Int",
    label: "Integer",
    description: "Numeric values like quantity or rating",
    icon: <Hash size={16} />,
    color: "bg-warning/8 border-warning/20",
    badgeColor: "warning",
  },
  {
    key: "Bool",
    label: "Boolean (Yes / No)",
    description: "Toggle fields like active, available, etc.",
    icon: <ToggleLeft size={16} />,
    color: "bg-success/8 border-success/20",
    badgeColor: "success",
  },
];

/* ================= COMPONENT ================= */

export default function CustomFieldsBuilder({ fields, onFieldsChange }: CustomFieldsBuilderProps) {
  const addField = (type: TCustomFieldType) => {
    const current = fields[type];
    if (current.length >= MAX_PER_TYPE) return;
    const newField: ICustomField = {
      id: crypto.randomUUID(),
      type,
      name: "",
      showInTable: true,
    };
    onFieldsChange({ ...fields, [type]: [...current, newField] });
  };

  const updateField = (type: TCustomFieldType, id: string, name: string, showInTable: boolean) => {
    onFieldsChange({
      ...fields,
      [type]: fields[type].map((f) => (f.id === id ? { ...f, name, showInTable } : f)),
    });
  };

  const removeField = (type: TCustomFieldType, id: string) => {
    onFieldsChange({
      ...fields,
      [type]: fields[type].filter((f) => f.id !== id),
    });
  };

  const totalFields = Object.values(fields).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-default-500">
            Define column names for your inventory items. Up to{" "}
            <span className="font-semibold">3 fields per type</span>.
          </p>
        </div>
        {totalFields > 0 && (
          <Chip size="sm" variant="flat" color="primary">
            {totalFields} field{totalFields !== 1 ? "s" : ""}
          </Chip>
        )}
      </div>

      {/* Section per type */}
      {TYPE_CONFIG.map(({ key, label, description, icon, color, badgeColor }) => {
        const typeFields = fields[key];
        const atMax = typeFields.length >= MAX_PER_TYPE;

        return (
          <div key={key} className={`rounded-xl border p-4 space-y-3 ${color}`}>
            {/* Section header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-${badgeColor}`}>{icon}</span>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-default-500">{description}</p>
                </div>
                <Chip size="sm" variant="flat" color={badgeColor} className="ml-1">
                  {typeFields.length} / {MAX_PER_TYPE}
                </Chip>
              </div>
              <Button
                size="sm"
                variant="flat"
                color={badgeColor}
                startContent={<Plus size={14} />}
                isDisabled={atMax}
                onPress={() => addField(key)}
              >
                Add Field
              </Button>
            </div>

            {/* Fields list */}
            {typeFields.length > 0 ? (
              <div className="space-y-2">
                {typeFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <span className="text-xs text-default-400 w-5 text-right shrink-0">
                      {index + 1}.
                    </span>
                    <Input
                      value={field.name}
                      onValueChange={(val) => updateField(key, field.id, val, field.showInTable)}
                      placeholder={`Column name (e.g. "${PLACEHOLDER_EXAMPLES[key][index]}")`}
                      size="sm"
                      className="flex-1"
                      aria-label={`${label} field ${index + 1} name`}
                      classNames={{
                        inputWrapper: "bg-content1",
                      }}
                    />
                    <Switch
                      isSelected={field.showInTable}
                      onValueChange={(val) => updateField(key, field.id, field.name, val)}
                      size="sm"
                    >
                      Show in table
                    </Switch>
                    <button
                      onClick={() => removeField(key, field.id)}
                      className="text-danger/50 hover:text-danger transition-colors p-1 rounded shrink-0"
                      aria-label="Remove field"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-default-400 text-center py-2">
                No {label.toLowerCase()} fields yet — press &quot;Add Field&quot; to add one.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================= PLACEHOLDER HINTS ================= */

const PLACEHOLDER_EXAMPLES: Record<TCustomFieldType, [string, string, string]> = {
  String: ["Condition", "Brand", "Serial No."],
  Text: ["Notes", "Description", "Remarks"],
  Int: ["Quantity", "Rating", "Shelf No."],
  Bool: ["Available", "Verified", "In Warranty"],
};
