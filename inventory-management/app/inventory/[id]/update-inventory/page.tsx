"use client";

import { transformToCustomFieldConfig } from "../../_helper.ts/transformToCustomFieldConfig";
import { Save, ArrowLeft, Settings, CheckCircle, Database, Users } from "lucide-react";
import { inventoryToCustomFields } from "../../_helper.ts/inventoryToCustomFields";
import { deriveCustomIdValues } from "../../_helper.ts/deriveCustomIdValues";
import CreateInventorySkeleton from "@/components/createInventorySkeleton";
import { inventoryToSegments } from "../../_helper.ts/inventoryToSegments";
import CustomFieldsBuilder from "../../_components/CustomFieldsBuilder";
import { useCallback, useEffect, useRef, useState } from "react";
import CustomIdBuilder from "../../_components/CustomIdBuilder";
import { inventoryService } from "@/services/inventory.service";
import { categoryService } from "@/services/category.service";
import { getStatusConfig } from "../../_helper.ts/statusConfig";
import UserInput, { User } from "../../_components/UserInput";
import TagInput, { Tag } from "../../_components/TagInput";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useParams, useRouter } from "next/navigation";
import { Select, SelectItem } from "@heroui/select";
import { Input, Textarea } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import {
  IInventory,
  ICustomFieldsState,
  EMPTY_CUSTOM_FIELDS,
  ISegment,
  TSaveStatus,
} from "../../_interface";

// -------------------------------------------------------
// Component
// -------------------------------------------------------
export default function UpdateInventoryPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<TSaveStatus>("idle");
  const [countdown, setCountdown] = useState<number>(5);
  const [error, setError] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[] | undefined>(
    undefined,
  );

  const [customIdItems, setCustomIdItems] = useState<ISegment[]>([]);

  const [customFields, setCustomFields] = useState<ICustomFieldsState>(EMPTY_CUSTOM_FIELDS);
  const [users, setUsers] = useState<User[]>([]);
  const [isInvPublic, setIsInvPublic] = useState(false);

  // Refs for auto-save tracking
  const isInitialized = useRef(false);
  const lastSavedSnapshot = useRef<string>("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSaving = useRef(false);

  // Build payload
  const buildPayload = useCallback(
    () => ({
      title,
      description,
      imageUrl,
      categoryName: category,
      tags: tags.map((t) => t.name),
      customIdTemplates: deriveCustomIdValues(customIdItems),
      customFieldConfig: transformToCustomFieldConfig(customFields),
      isPublic: isInvPublic,
      writeAccess: users,
    }),
    [title, description, imageUrl, category, tags, customIdItems, customFields, isInvPublic, users],
  );

  // console.log(buildPayload());

  const getSnapshot = useCallback(() => JSON.stringify(buildPayload()), [buildPayload]);

  // Core save function
  const doSave = useCallback(async () => {
    if (isSaving.current) return;
    isSaving.current = true;

    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }

    setSaveStatus("saving");
    setError("");

    const minWait = new Promise((resolve) => setTimeout(resolve, 1000));

    const [response] = await Promise.all([
      inventoryService.updateInventory(id, buildPayload()),
      minWait,
    ]);

    isSaving.current = false;

    if (response.success) {
      lastSavedSnapshot.current = getSnapshot();
      console.log(response.data);
      setSaveStatus("saved");

      setTimeout(() => setSaveStatus("idle"), 4000);
    } else {
      setSaveStatus("error");
      setError(response.message ?? "Failed to update inventory.");
    }
  }, [id, buildPayload, getSnapshot]);

  // Countdown helper
  const startCountdown = useCallback(
    (seconds: number) => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      setCountdown(seconds);
      setSaveStatus("countdown");

      let remaining = seconds;
      countdownInterval.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(countdownInterval.current!);
          countdownInterval.current = null;
          doSave();
        }
      }, 1000);
    },
    [doSave],
  );

  // Trigger auto-save
  useEffect(() => {
    if (!isInitialized.current) return;

    const currentSnapshot = getSnapshot();
    if (currentSnapshot === lastSavedSnapshot.current) return;

    setSaveStatus("editing");

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }

    debounceTimer.current = setTimeout(() => {
      startCountdown(7);
    }, 1500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    description,
    imageUrl,
    category,
    tags,
    customIdItems,
    customFields,
    isInvPublic,
    users,
  ]);

  // Load existing inventory
  useEffect(() => {
    const loadData = async () => {
      const [invRes, catRes] = await Promise.all([
        inventoryService.getInventoryById(id),
        categoryService.getCategories(),
      ]);

      if (invRes?.success && invRes.data) {
        const inv: IInventory = invRes.data;

        const invCustomFields = inventoryToCustomFields(inv);
        const invSegments = inv.customIdTemplates ? inventoryToSegments(inv) : [];
        const invTags = (inv.inventoryTags ?? []).map((name: string) => name);
        const invUsers = inv.writeAccess ?? [];
        const initialPayload = {
          title: inv.title ?? "",
          description: inv.description ?? "",
          imageUrl: inv.imageUrl ?? "",
          categoryName: inv.categoryName ?? "",
          tags: invTags,
          customIdTemplates: deriveCustomIdValues(invSegments),
          customFieldConfig: transformToCustomFieldConfig(invCustomFields),
          isPublic: inv.isPublic ?? false,
          writeAccess: invUsers,
        };
        lastSavedSnapshot.current = JSON.stringify(initialPayload);

        setTitle(inv.title ?? "");
        setDescription(inv.description ?? "");
        setCategory(inv.categoryName ?? "");
        setImageUrl(inv.imageUrl ?? "");
        setTags(
          (inv.inventoryTags ?? []).map((name: string) => ({ id: crypto.randomUUID(), name })),
        );
        setIsInvPublic(inv.isPublic ?? false);
        setUsers(inv.writeAccess);
        setCustomFields(invCustomFields);
        setCustomIdItems(invSegments);
      }

      setCategories(catRes?.data ?? []);
      setLoading(false);

      setTimeout(() => {
        isInitialized.current = true;
      }, 300);
    };

    loadData();
  }, [id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);

  const currentStatus = getStatusConfig(saveStatus, countdown);

  // -----------------------------
  // Optimistic Locking
  // -----------------------------
  useEffect(() => {
    inventoryService.lockInventory(id);

    return () => {
      inventoryService.releaseInventory(id);
    };
  }, [id]);

  useEffect(() => {
    const handleExit = () => {
      const proxyUrl = `/api/proxy/api/v1/inventory/${id}/release`;
      navigator.sendBeacon(proxyUrl);
    };

    window.addEventListener("beforeunload", handleExit);

    return () => {
      window.removeEventListener("beforeunload", handleExit);
    };
  }, [id]);

  if (loading) return <CreateInventorySkeleton />;

  return (
    <div className="flex flex-col gap-8 py-8 px-4 max-w-4xl mx-auto">
      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center bg-content1 p-6 rounded-2xl shadow-sm border border-default-200"
      >
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="flat" onPress={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Update Inventory</h1>
            <p className="text-default-500">Changes are saved automatically</p>
          </div>
        </div>

        {/* Right side: status + save button */}
        <div className="flex items-center gap-4">
          {/* Live status badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={saveStatus + (saveStatus === "countdown" ? countdown : "")}
              className={`flex items-center gap-1.5 text-xs font-medium ${currentStatus.color}`}
            >
              {currentStatus.icon}
              <span className={currentStatus.pulse ? "animate-pulse" : ""}>
                {currentStatus.label}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Manual save button */}
          <Button
            color={saveStatus === "error" ? "danger" : "primary"}
            variant={saveStatus === "saved" ? "flat" : "solid"}
            onPress={doSave}
            isDisabled={saveStatus === "saving"}
            startContent={
              saveStatus === "saving" ? <Spinner size="sm" color="white" /> : <Save size={16} />
            }
            size="sm"
          >
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "error"
                ? "Retry Save"
                : "Save Now"}
          </Button>
        </div>
      </motion.div>

      {/* Inline error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-danger-50 text-danger-600 rounded-2xl px-4 py-2 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs aria-label="Inventory Options" color="primary" variant="underlined">
        {/* GENERAL SETTINGS */}
        <Tab
          key="settings"
          title={
            <div className="flex items-center gap-2">
              <Settings size={18} />
              <span>{t("inventory.create.generalSettings")}</span>
            </div>
          }
        >
          <div className="pt-4 flex flex-col gap-6">
            <Input
              label={t("inventory.create.generalSettings.title")}
              placeholder={t("inventory.create.generalSettings.title.placeholder")}
              variant="bordered"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              label={t("inventory.create.generalSettings.description")}
              placeholder={t("inventory.create.generalSettings.description.placeholder")}
              variant="bordered"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Select
              label={t("inventory.create.generalSettings.category")}
              selectedKeys={category ? [category] : []}
              variant="bordered"
              onChange={(e) => setCategory(e.target.value)}
            >
              <SelectItem isReadOnly key="">
                {t("inventory.create.generalSettings.category.placeholder")}
              </SelectItem>
              <>
                {(categories ?? []).map((c) => (
                  <SelectItem key={c.name}>
                    {c.name
                      .split(" ")
                      .map((a) => a[0].toUpperCase() + a.slice(1))
                      .join(" ")}
                  </SelectItem>
                ))}
              </>
            </Select>
            <Input
              label={t("inventory.create.generalSettings.imageUrl")}
              placeholder={t("inventory.create.generalSettings.imageUrl.placeholder")}
              variant="bordered"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <TagInput value={tags} onChange={setTags} />
          </div>
        </Tab>

        {/* CUSTOM IDs */}
        <Tab
          key="custom_ids"
          title={
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              <span>{t("inventory.create.customId")}</span>
            </div>
          }
        >
          <div className="pt-4">
            <CustomIdBuilder items={customIdItems} onItemsChange={setCustomIdItems} />
          </div>
        </Tab>

        {/* CUSTOM FIELDS */}
        <Tab
          key="fields"
          title={
            <div className="flex items-center gap-2">
              <Database size={18} />
              <span>{t("inventory.create.customFields")}</span>
            </div>
          }
        >
          <div className="pt-4">
            <CustomFieldsBuilder fields={customFields} onFieldsChange={setCustomFields} />
          </div>
        </Tab>

        {/* ACCESS */}
        <Tab
          key="access"
          title={
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span>{t("inventory.create.accessSettings")}</span>
            </div>
          }
        >
          <div className="pt-4 flex flex-col gap-6">
            <div className="flex items-center justify-between p-4 bg-content2 rounded-lg border border-default-200">
              <div>
                <h4 className="font-bold">
                  {t("inventory.create.accessSettings.publicInventory")}
                </h4>
                <p className="text-sm text-default-500">
                  {t("inventory.create.accessSettings.publicInventory.hint")}
                </p>
              </div>
              <Switch color="success" isSelected={isInvPublic} onValueChange={setIsInvPublic} />
            </div>

            <div
              className={`relative transition-opacity ${isInvPublic ? "opacity-50 pointer-events-none select-none" : ""}`}
              aria-disabled={isInvPublic}
            >
              <h4 className="font-bold mb-2">
                {t("inventory.create.accessSettings.userWithWriteAccess")}
              </h4>
              <UserInput value={users} onChange={setUsers} />
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
