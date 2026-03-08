"use client";

import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@heroui/button";
import React from "react";

interface GlobalToolbarProps {
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditDisabled?: boolean;
  isDeleteDisabled?: boolean;
  title?: string;
  children?: React.ReactNode;
}

export function GlobalToolbar({
  onAdd,
  onEdit,
  onDelete,
  isEditDisabled = true,
  isDeleteDisabled = true,
  title,
  children
}: GlobalToolbarProps) {
  const { t } = useLanguage();

  return (
    <div className="flex w-full items-center justify-between pb-4 border-b border-default-200 mb-4 mt-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">{title || t("toolbar.actions")}</h2>
      </div>
      <div className="flex gap-2">
        {onAdd && (
          <Button size="sm" color="primary" startContent={<PlusIcon size={16} />} onPress={onAdd}>
            {t("toolbar.add")}
          </Button>
        )}
        {onEdit && (
          <Button size="sm" 
            isDisabled={isEditDisabled} 
            color="secondary" 
            variant="flat" 
            startContent={<EditIcon size={16} />} 
            onPress={onEdit}
          >
            {t("toolbar.edit")}
          </Button>
        )}
        {onDelete && (
          <Button size="sm" 
            isDisabled={isDeleteDisabled} 
            color="danger" 
            variant="flat" 
            startContent={<TrashIcon size={16} />} 
            onPress={onDelete}
          >
            {t("toolbar.delete")}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
