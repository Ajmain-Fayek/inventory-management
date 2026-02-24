"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Globe } from "lucide-react";

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          isIconOnly
          variant="light"
          aria-label="Language switch"
          className="text-default-500"
        >
          <Globe size={20} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language options"
        onAction={(key) => setLanguage(key as "en" | "pl")}
        selectedKeys={new Set([language])}
        selectionMode="single"
      >
        <DropdownItem key="en">English</DropdownItem>
        <DropdownItem key="pl">Polski</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
