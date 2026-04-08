"use client";

import React, { useState, useEffect } from "react";
import { getInventoryColumns } from "../../../../_helper.ts/getInventoryColumns";
import { TCustomValueKey, IItem, TSaveStatus } from "@/app/inventory/_interface";
import { inventoryService } from "@/services/inventory.service";
import { useInventory } from "@/context/InventoryContext";
import { useLanguage } from "@/context/LanguageContext";
import { useParams, useRouter } from "next/navigation";
import { itemService } from "@/services/item.service";
import ItemSkeleton from "@/components/itemSkeleton";
import { Input, Textarea } from "@heroui/input";
import { ArrowLeft, Save } from "lucide-react";
import { Spinner } from "@heroui/spinner";
import { Switch } from "@heroui/switch";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";

export default function UpdateItemPage() {
  const params = useParams();
  const { id, itemId } = params;
  const router = useRouter();
  const { t } = useLanguage();
  const {
    inventoryColumns,
    inventory,
    setInventoryColumns,
    setInventory,
    items,
    isLockedByOtherUser,
  } = useInventory();
  const [item, setItem] = useState<IItem>();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<TSaveStatus>("idle");
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState("");

  const fetchItem = async () => {
    setLoading(true);

    if (!inventory) {
      const inventoryRes = await inventoryService.getInventoryById(id as string);

      const customCols = await getInventoryColumns(inventoryRes.data);

      setInventoryColumns(customCols);
      setInventory(inventoryRes.data);
    }

    if (items && items.length > 0) {
      const localItem = items.find((i) => i.id === itemId);
      if (localItem) {
        setItem(localItem);
        setLoading(false);
        return;
      }
    }

    const result = await itemService.getItemById(itemId as string, id as string);

    if (result && result.success === false) {
      console.error("API Error:", result.message);
      setItem(undefined);
    } else {
      setItem(result.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchItem();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, itemId]);

  const [formData, setFormData] = useState<Record<TCustomValueKey, string | number | boolean>>(
    {} as Record<TCustomValueKey, string | number | boolean>,
  );

  useEffect(() => {
    if (!item || inventoryColumns.length === 0 || isInitialized) return;

    const initialData = inventoryColumns.reduce(
      (acc, [key, , type]) => {
        if (type === "Bool") acc[key] = item[key]!;
        else if (type === "Int") acc[key] = item[key]!;
        else acc[key] = item[key]!;

        return acc;
      },
      {} as Record<TCustomValueKey, string | number | boolean>,
    );

    setFormData(initialData);

    const timer = setTimeout(() => setIsInitialized(true), 500);
    return () => clearTimeout(timer);
  }, [inventoryColumns, item, isInitialized]);

  const handleChange = (key: TCustomValueKey, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSaveStatus("saving");
    setError("");

    const minWait = new Promise((resolve) => setTimeout(resolve, 3000));

    const [response] = await Promise.all([
      itemService.updateItem(
        { ...formData, version: item?.version },
        id as string,
        itemId as string,
      ),
      minWait,
    ]);

    if (response.success) {
      if (response?.data?.version) {
        setItem((prev) => (prev ? { ...prev, version: response.data.version } : prev));
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("error");
      setError(response.message ?? "Failed to update item");
    }
  };

  if (loading) {
    return <ItemSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 py-8 items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl flex justify-between items-center bg-content1 p-6 rounded-2xl shadow-sm border border-default-200"
      >
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="flat" onPress={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Item: {item?.customId}</h1>
            <p className="text-default-500">
              {t("item.create.header.subtitle")} {inventory?.title}
            </p>
          </div>
        </div>
        <Button
          color={saveStatus === "error" ? "danger" : "primary"}
          variant={saveStatus === "saved" ? "flat" : "solid"}
          onPress={handleSubmit}
          isDisabled={isLockedByOtherUser || saveStatus === "saving"}
          startContent={
            saveStatus === "saving" ? <Spinner size="sm" color="white" /> : <Save size={16} />
          }
          size="sm"
        >
          {saveStatus === "saving"
            ? "Saving…"
            : saveStatus === "error"
              ? "Retry Save"
              : saveStatus === "saved"
                ? "Item Saved"
                : "Save Item"}
        </Button>
      </motion.div>

      {inventory?.isInEditMode && (
        <div className="max-w-3xl px-2 bg-red-50 text-red-600 text-center w-fit">
          This inventory is currently read-only because another user is editing it. Please try again
          in a few minutes.
        </div>
      )}
      {error && <div className="max-w-3xl px-3 py-2 bg-danger-50 text-danger-700 rounded-md">{error}</div>}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-3xl"
      >
        {/* Custom Fields defined by Inventory Creator */}
        <div className="flex flex-col gap-6 bg-content1 p-8 rounded-2xl shadow-sm border border-default-200">
          <h2 className="text-xl font-bold border-b border-default-200 pb-2 flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Custom Fields
            </span>
          </h2>
          {inventoryColumns.length > 0 ? (
            inventoryColumns.map(([key, label, type]) => {
              switch (type) {
                case "String":
                  return (
                    <Input
                      key={key}
                      label={label}
                      placeholder={label}
                      variant="bordered"
                      value={formData[key] as string}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  );
                case "Text":
                  return (
                    <Textarea
                      key={key}
                      label={label}
                      placeholder={label}
                      value={formData[key] as string}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  );
                case "Int":
                  return (
                    <Input
                      key={key}
                      label={label}
                      placeholder={label}
                      variant="bordered"
                      type="number"
                      value={String(formData[key] ?? "")}
                      onChange={(e) => handleChange(key, Number(e.target.value))}
                    />
                  );
                case "Bool":
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span>{label}</span>
                      <Switch
                        isSelected={!!formData[key]}
                        onValueChange={(val) => handleChange(key, val)}
                      />
                    </div>
                  );
                default:
                  return null;
              }
            })
          ) : (
            <div>No field created during inventory creation. Try updating the inventory.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
