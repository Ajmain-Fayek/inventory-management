"use client";

import { getInventoryColumns } from "../../../_helper.ts/getInventoryColumns";
import { inventoryService } from "@/services/inventory.service";
import { useInventory } from "@/context/InventoryContext";
import { ArrowLeft, Printer, Edit } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useParams, useRouter } from "next/navigation";
import { itemService } from "@/services/item.service";
import ItemSkeleton from "@/components/itemSkeleton";
import { IItem } from "@/app/inventory/_interface";
import { Input, Textarea } from "@heroui/input";
import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { motion } from "framer-motion";

export default function ItemPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useLanguage();
  const params = useParams();
  const { id, itemId } = params;
  const { items, inventoryColumns, inventory, setInventoryColumns, setInventory } = useInventory();
  const [item, setItem] = useState<IItem>();
  const [loading, setLoading] = useState<boolean>(true);

  // console.log(item);

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
    const getItem = async () => {
      await fetchItem();
    };

    getItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, itemId]);

  const router = useRouter();

  if (loading) {
    return <ItemSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 py-8 items-center print:p-0 print:gap-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex justify-between items-center bg-content1 p-6 rounded-2xl shadow-sm border border-default-200 print:hidden"
      >
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="flat" onPress={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Item ID: <span className="whitespace-nowrap">{item?.customId}</span>
            </h1>
            <p className="text-default-500 text-sm">Inventory: {item?.inventoryTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="flat"
            onPress={() => window.print()}
            startContent={<Printer size={18} />}
          >
            Print
          </Button>
          <Button
            color="secondary"
            onPress={() => router.push(`/inventory/${id}/item/${itemId}/update-item`)}
            startContent={<Edit size={18} />}
          ></Button>
        </div>
      </motion.div>

      {/* Print Header (Visible only on paper) */}
      <div className="hidden print:flex w-full justify-between items-end border-b-2 border-black pb-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase">Item Specification</h1>
          <p className="text-lg font-mono">ID: {item?.customId}</p>
          <p className="text-sm text-gray-600">Inventory: {item?.inventoryTitle}</p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Printed: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-4xl print:max-w-none"
      >
        <div className="flex w-full flex-col gap-6 bg-content1 p-8 rounded-2xl shadow-sm border border-default-200 print:border-none print:shadow-none print:p-0 print:bg-transparent">
          {/* Dynamic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 print:grid-cols-2">
            {item && inventoryColumns.length > 0 ? (
              inventoryColumns.map(([key, label, type]) => {
                const value = item[key];
                const isTextarea = type === "Text";

                return (
                  <div
                    key={key}
                    className={`${isTextarea ? "col-span-full" : "col-span-1"} flex flex-col gap-1 border-b border-default-100 pb-2 print:border-gray-200`}
                  >
                    <span className="text-xs font-bold uppercase text-default-400 print:text-gray-500">
                      {label}
                    </span>

                    {/* Field Value */}
                    <div className="print:hidden">
                      {isTextarea ? (
                        <Textarea readOnly variant="bordered" value={value as string} />
                      ) : type === "Bool" ? (
                        <div className="flex items-center gap-2 py-2">
                          <Switch isSelected={!!value} isReadOnly />
                          <span className="text-sm">{value ? "Yes" : "No"}</span>
                        </div>
                      ) : (
                        <Input readOnly variant="bordered" value={String(value ?? "")} />
                      )}
                    </div>

                    {/* Plain text for Print Only */}
                    <div className="hidden print:block text-base font-medium">
                      {type === "Bool" ? (value ? "☑ Yes" : "☐ No") : String(value ?? "—")}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-10 text-center text-default-400">
                No fields available.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
