"use client";

import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function CreateItemPage({ params }: { params: { id: string } }) {
  console.log(params);
  const router = useRouter();
  const { t } = useLanguage();

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
          <Button color="primary" startContent={<Save size={18} />}>
            {t("item.create.button")}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Standard Fields */}
        <div className="flex flex-col gap-6 bg-content1 p-8 rounded-2xl shadow-sm border border-default-200">
          <h2 className="text-xl font-bold border-b border-default-200 pb-2">Standard Fields</h2>

          <Input
            label="Custom ID"
            placeholder="Auto-generated"
            variant="bordered"
            description="Leave empty for auto-generation based on sequence rules."
          />
          <Input label="Item Name" placeholder="e.g. Dell XPS 13" variant="bordered" isRequired />
        </div>

        {/* Custom Fields defined by Inventory Creator */}
        <div className="flex flex-col gap-6 bg-content1 p-8 rounded-2xl shadow-sm border border-default-200">
          <h2 className="text-xl font-bold border-b border-default-200 pb-2 flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Custom Fields
            </span>
          </h2>

          {/* Single-line text */}
          <Input label="Condition" placeholder="E.g., New, Good, Fair, Poor" variant="bordered" />

          {/* Numeric field */}
          <Input label="Purchase Year" type="number" placeholder="2024" variant="bordered" />

          {/* Multi-line text field */}
          <Textarea label="Staff Notes" placeholder="Any additional notes" variant="bordered" />

          {/* Document/Image Link field */}
          <Input
            label="Receipt Document"
            type="url"
            placeholder="https://..."
            variant="bordered"
            startContent={<LinkIcon size={16} className="text-default-400" />}
          />

          {/* Checkbox / Boolean field */}
          <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg border border-default-200">
            <div>
              <p className="font-semibold text-sm">Requires Maintenance</p>
              <p className="text-xs text-default-500">Check if item needs repair</p>
            </div>
            <Switch defaultSelected={false} color="warning" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
