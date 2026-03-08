"use client";

import { getInventoryColumns } from "../../../_helper.ts/getInventoryColumns";
import { inventoryService } from "@/services/inventory.service";
import { TCustomValueKey } from "@/app/inventory/_interface";
import { useInventory } from "@/context/InventoryContext";
import { useLanguage } from "@/context/LanguageContext";
import { useParams, useRouter } from "next/navigation";
import { itemService } from "@/services/item.service";
import ItemSkeleton from "@/components/itemSkeleton";
import { Input, Textarea } from "@heroui/input";
import { Save, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import { Switch } from "@heroui/switch";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";

export default function CreateItemPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { t } = useLanguage();
  const { inventoryColumns, inventory, setInventoryColumns, setInventory, setItems, items } =
    useInventory();
  const [loading, setLoading] = useState(true);
  const [savingInv, setSavingInv] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);

      const inventoryRes = await inventoryService.getInventoryById(id as string);

      const customCols = await getInventoryColumns(inventoryRes.data);

      setInventoryColumns(customCols);
      setInventory(inventoryRes.data);

      setLoading(false);
    };

    if (!inventory) {
      fetchInventory();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [formData, setFormData] = useState<Record<TCustomValueKey, string | number | boolean>>(
    {} as Record<TCustomValueKey, string | number | boolean>,
  );

  useEffect(() => {
    if (inventoryColumns.length === 0) return;

    const initialData = inventoryColumns.reduce(
      (acc, [key, , type]) => {
        if (type === "Bool") acc[key] = false;
        else if (type === "Int") acc[key] = 0;
        else acc[key] = "";

        return acc;
      },
      {} as Record<string, string | number | boolean>,
    );

    setFormData(initialData);
  }, [inventoryColumns]);

  const handleChange = (key: TCustomValueKey, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const payload = {
    ...formData,
  };

  const handleSubmit = async () => {
    setSavingInv("saving");
    setError("");

    const minWait = new Promise((resolve) => setTimeout(resolve, 2500));

    const [response] = await Promise.all([itemService.createItem(payload, id as string), minWait]);

    if (response.success) {
      setSavingInv("saved");
      setItems([...items, response.data]);
      setTimeout(() => {
        router.push(`/inventory/${id}`);
      }, 1500);
    } else {
      setSavingInv("error");
      setError(response.message);
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
            <h1 className="text-2xl font-bold">{t("item.create.header")}</h1>
            <p className="text-default-500">{t("item.create.header.subtitle")} Office Hardware</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            disabled={savingInv === "saving" || savingInv === "saved"}
            color="primary"
            onPress={handleSubmit}
            startContent={
              savingInv === "saving" ? <Spinner size="sm" color="white" /> : <Save size={18} />
            }
          >
            {savingInv === "saving"
              ? `Saving Item`
              : savingInv === "saved"
                ? `Item Saved`
                : "Save Item"}
          </Button>
        </div>
      </motion.div>

      {error && <div className="bg-red-50 text-red-500 rounded-2xl px-4 py-2">{error}</div>}

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
                        checked={formData[key] as boolean}
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
