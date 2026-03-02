"use client";

import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Tabs, Tab } from "@heroui/tabs";
import { motion } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Settings,
  CheckCircle,
  Database,
  Users,
  Plus,
  GripVertical,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { categoryService } from "@/services/category.service";
import TagInput from "../_components/TagInput";
import CustomIdBuilder, { CustomIdValues, Segment } from "../_components/CustomIdBuilder";

export default function CreateInventoryPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[] | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [customIdValues, setCustomIdValues] = useState<CustomIdValues>({
    fixedValueState: true,
    fixedValue: "📚",
    fixedPosition: 0,
    sequenceValueState: false,
    randomValueState: false,
    datetimeValueState: false,
  });
  // Lifted here so HeroUI Tabs unmounting the panel doesn't wipe the builder state
  const [customIdItems, setCustomIdItems] = useState<Segment[]>([
    { id: crypto.randomUUID(), type: "fixed", value: "📚", separator: "_" },
  ]);

  console.log(customIdItems, customIdValues);

  const getCategories = async () => {
    const categories = await categoryService.getCategories();

    setCategories(categories.data);
    setLoading(false);
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className="flex flex-col gap-8 py-8 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex justify-between items-center bg-content1 p-6 rounded-2xl shadow-sm border border-default-200"
      >
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="flat" onPress={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t("inventory.create.header")}</h1>
            <p className="text-default-500">{t("inventory.create.header.subtitle")}</p>
          </div>
        </div>

        <Button color="primary" startContent={<Save size={18} />}>
          {t("inventory.create.button")}
        </Button>
      </motion.div>

      <Tabs aria-label="Inventory Options" color="primary" variant="underlined">
        {/* GENERAL SETTINGS TAB */}
        <Tab
          key="settings"
          title={
            <div className="flex items-center justify-center gap-2">
              <Settings size={18} />
              <span>{t("inventory.create.generalSettings")}</span>
            </div>
          }
        >
          <div className="pt-4 max-w-4xl flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <Input
                label={t("inventory.create.generalSettings.title")}
                placeholder={t("inventory.create.generalSettings.title.placeholder")}
                variant="bordered"
                className="w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                label={t("inventory.create.generalSettings.description")}
                placeholder={t("inventory.create.generalSettings.description.placeholder")}
                variant="bordered"
                className="w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Select
                label={t("inventory.create.generalSettings.category")}
                defaultSelectedKeys={[category]}
                variant="bordered"
                className="w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <SelectItem isReadOnly={true} key="">
                  {t("inventory.create.generalSettings.category.placeholder")}
                </SelectItem>
                {loading ? (
                  <SelectItem key="00">Loading...</SelectItem>
                ) : (
                  (categories ?? []).map((c) => (
                    <SelectItem key={c.name}>
                      {c.name
                        .split(" ")
                        .map((a) => a[0].toUpperCase() + a.slice(1, a.length))
                        .join(" ")}
                    </SelectItem>
                  ))
                )}
              </Select>
              <TagInput value={tags} onChange={setTags} />
            </div>
          </div>
        </Tab>

        {/* CUSTOM IDs TAB */}
        <Tab
          key="custom_ids"
          title={
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              <span>{t("inventory.create.customId")}</span>
            </div>
          }
        >
          <div className="pt-4 max-w-4xl flex flex-col gap-6">
            <CustomIdBuilder
              items={customIdItems}
              onItemsChange={setCustomIdItems}
              onChange={setCustomIdValues}
            />
          </div>
        </Tab>

        {/* CUSTOM FIELDS TAB */}
        <Tab
          key="fields"
          title={
            <div className="flex items-center gap-2">
              <Database size={18} />
              <span>{t("inventory.create.customFields")}</span>
            </div>
          }
        >
          <div className="pt-4 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{t("inventory.create.customFields.heading")}</h3>
              <Button size="sm" color="primary" startContent={<Plus size={16} />}>
                {t("inventory.create.customFields.button")}
              </Button>
            </div>
            <div className="flex flex-col gap-4 w-full">
              {/* Example fields manually listed for UI demo */}
              <div className="flex items-center gap-4 bg-content2 p-4 rounded-lg border border-default-200">
                <GripVertical className="text-default-400 cursor-grab" />
                <div className="flex-1">
                  <p className="font-bold">Condition</p>
                  <p className="text-xs text-default-500">Single-line text</p>
                </div>
                <Switch defaultSelected size="sm">
                  {t("inventory.create.customFields.toggle")}
                </Switch>
                <Button isIconOnly color="danger" variant="light">
                  X
                </Button>
              </div>
              <div className="flex items-center gap-4 bg-content2 p-4 rounded-lg border border-default-200">
                <GripVertical className="text-default-400 cursor-grab" />
                <div className="flex-1">
                  <p className="font-bold">Warranty Expiry</p>
                  <p className="text-xs text-default-500">Date</p>
                </div>
                <Switch defaultSelected size="sm">
                  {t("inventory.create.customFields.toggle")}
                </Switch>
                <Button isIconOnly color="danger" variant="light">
                  X
                </Button>
              </div>
            </div>
          </div>
        </Tab>

        {/* ACCESS TAB */}
        <Tab
          key="access"
          title={
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span>{t("inventory.create.accessSettings")}</span>
            </div>
          }
        >
          <div className="pt-4 max-w-4xl flex flex-col gap-6">
            <div className="flex items-center justify-between p-4 bg-content2 rounded-lg border border-default-200">
              <div>
                <h4 className="font-bold">
                  {t("inventory.create.accessSettings.publicInventory")}
                </h4>
                <p className="text-sm text-default-500">
                  {t("inventory.create.accessSettings.publicInventory.hint")}
                </p>
              </div>
              <Switch color="success" />
            </div>

            <div>
              <h4 className="font-bold mb-2">
                {t("inventory.create.accessSettings.userWithWriteAccess")}
              </h4>
              <Input
                placeholder={t("inventory.create.accessSettings.userWithWriteAccess.placeholder")}
                variant="bordered"
                className="mb-4"
              />
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center p-3 bg-default-100 rounded-md">
                  <span>bob@example.com</span>
                  <Button size="sm" color="danger" variant="flat">
                    {t("inventory.create.accessSettings.userWithWriteAccess.remove")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Tab>

        {/* STATS TAB */}
        <Tab
          key="stats"
          title={
            <div className="flex items-center gap-2">
              <BarChart3 size={18} />
              <span>Statistics</span>
            </div>
          }
        >
          <div className="pt-4 max-w-4xl">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 text-center">
                <p className="text-primary font-bold">Total Items</p>
                <p className="text-4xl font-mono mt-2 cursor-pointer">1,240</p>
              </div>
              <div className="bg-secondary/10 p-6 rounded-xl border border-secondary/20 text-center">
                <p className="text-secondary font-bold">Avg. Condition String Length</p>
                <p className="text-4xl font-mono mt-2">12</p>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
