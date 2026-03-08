"use client";

import { Save, ArrowLeft, Settings, CheckCircle, Database, Users, BarChart3 } from "lucide-react";
import { transformToCustomFieldConfig } from "../_helper.ts/transformToCustomFieldConfig";
import CreateInventorySkeleton from "@/components/createInventorySkeleton";
import CustomFieldsBuilder from "../_components/CustomFieldsBuilder";
import { inventoryService } from "@/services/inventory.service";
import { categoryService } from "@/services/category.service";
import CustomIdBuilder from "../_components/CustomIdBuilder";
import { useLanguage } from "@/context/LanguageContext";
import TagInput, { Tag } from "../_components/TagInput";
import { Select, SelectItem } from "@heroui/select";
import UserInput from "../_components/UserInput";
import { Input, Textarea } from "@heroui/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { motion } from "framer-motion";
import {
  IWriteAccess,
  ICustomFieldsState,
  EMPTY_CUSTOM_FIELDS,
  ISegment,
  ICustomIdTemplateValues,
} from "../_interface";

// -------------------------------------------------------
// Component Function Start
// -------------------------------------------------------
export default function CreateInventoryPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingInv, setSavingInv] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  // General Settings Tab States
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  // store all categories for Selection
  const [categories, setCategories] = useState<{ id: string; name: string }[] | undefined>(
    undefined,
  );

  // Custom ID Tab states
  const [customIdValues, setCustomIdValues] = useState<ICustomIdTemplateValues>({
    fixedValueState: true,
    fixedValue: "📚",
    fixedPosition: 0,
    fixedSeparator: "_",
    sequenceValueState: true,
    sequenceValue: "D",
    sequenceValuePosition: 1,
    sequenceSeparator: "_",
    randomValueState: true,
    randomValue: "20bit",
    randomValuePosition: 2,
    randomSeparator: "_",
    datetimeValueState: true,
    datetimeValue: "yyyy",
    datetimeValuePosition: 3,
    datetimeSeparator: "_",
  });

  const [customIdItems, setCustomIdItems] = useState<ISegment[]>([
    { id: crypto.randomUUID(), type: "fixed", value: "📚", separator: "_" },
    { id: crypto.randomUUID(), type: "random", randomMode: "20bit", separator: "_" },
    { id: crypto.randomUUID(), type: "sequence", sequenceFormat: "D", separator: "_" },
    { id: crypto.randomUUID(), type: "datetime", dateFormat: "yyyy", separator: "_" },
  ]);

  // Custom Fields Tab States
  const [customFields, setCustomFields] = useState<ICustomFieldsState>(EMPTY_CUSTOM_FIELDS);

  // Access Tab States
  const [users, setUsers] = useState<IWriteAccess[]>([]);
  const [isInvPublic, setIsInvPublic] = useState<boolean>(false);

  // Load Categories for selection
  const getCategories = async () => {
    const categories = await categoryService.getCategories();

    setCategories(categories.data);
    setLoading(false);
  };

  useEffect(() => {
    getCategories();
  }, []);

  // ---------------------------------------------------------
  //        Ready Payload for creating Inventory
  // ---------------------------------------------------------
  const payload = {
    title,
    description,
    imageUrl,
    categoryName: category,
    tags: tags.map((t) => t.name),
    idTemplate: {
      ...customIdValues,
    },
    customFieldConfig: transformToCustomFieldConfig(customFields),
    isPublic: isInvPublic,
    writeAccess: users,
  };

  const handleSaveInventory = async () => {
    setSavingInv("saving");
    setError("");

    const minWait = new Promise((resolve) => setTimeout(resolve, 2500));

    const [response] = await Promise.all([inventoryService.createInventory(payload), minWait]);

    if (response.success) {
      setSavingInv("saved");

      setTimeout(() => {
        router.push(`/inventory/${response.data.id}`);
      }, 1500);
    } else {
      setSavingInv("error");
      setError(response.message);
    }
  };

  // console.log(users);

  if (loading) {
    return <CreateInventorySkeleton />;
  }

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

        <Button
          color="primary"
          onPress={handleSaveInventory}
          startContent={
            savingInv === "saving" ? <Spinner size="sm" color="white" /> : <Save size={18} />
          }
        >
          {savingInv === "saving"
            ? `Saving Inventory`
            : savingInv === "saved"
              ? `Inventory Saved`
              : "Save Inventory"}
        </Button>
      </motion.div>

      {error && <div className="bg-red-50 text-red-500 rounded-2xl px-4 py-2">{error}</div>}

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
                <>
                  {(categories ?? []).map((c) => (
                    <SelectItem key={c.name}>
                      {c.name
                        .split(" ")
                        .map((a) => a[0].toUpperCase() + a.slice(1, a.length))
                        .join(" ")}
                    </SelectItem>
                  ))}
                </>
              </Select>
              <Input
                label={t("inventory.create.generalSettings.imageUrl")}
                placeholder={t("inventory.create.generalSettings.imageUrl.placeholder")}
                variant="bordered"
                className="w-full"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
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
            <CustomFieldsBuilder fields={customFields} onFieldsChange={setCustomFields} />
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
              <Switch
                color="success"
                isSelected={isInvPublic}
                onValueChange={(e) => setIsInvPublic(e)}
              />
            </div>

            <div
              className={`relative transition-opacity ${
                isInvPublic ? "opacity-50 pointer-events-none select-none" : ""
              }`}
              aria-disabled={isInvPublic}
            >
              <h4 className="font-bold mb-2">
                {t("inventory.create.accessSettings.userWithWriteAccess")}
              </h4>
              <UserInput value={users} onChange={setUsers} />
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
