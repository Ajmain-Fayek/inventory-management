"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { CircleUserRound } from "lucide-react";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "../config/site";
import { ThemeSwitch } from "./theme-switch";
import { LanguageSwitch } from "./language-switch";
import { useLanguage } from "../context/LanguageContext";
import { SearchIcon, Logo } from "./icons";
import { useUser } from "../context/UserContext";

export const Navbar = () => {
  const { user, logout } = useUser();

  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNavItems = siteConfig.navItems.filter((item) =>
    user ? item.href !== "/auth/login" && item.href !== "/auth/register" : item.href !== "/logout",
  );

  const filteredNavMenuItems = siteConfig.navMenuItems.filter((item) =>
    user ? item.href !== "/auth/login" && item.href !== "/auth/register" : item.href !== "/logout",
  );

  const getColorClass = (href: string, isActive: boolean) => {
    if (href === "/logout") return "text-danger font-medium";
    if (href === "/auth/login") return "text-primary font-medium";
    if (href === "/auth/register") return "text-success font-medium";
    return isActive ? "text-primary font-medium" : "text-foreground";
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      labelPlacement="outside"
      placeholder={t("navbar.search")}
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none shrink-0" />
      }
      type="search"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={handleSearch}
    />
  );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">IMS</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {filteredNavItems.map((item, index) => (
            <NavbarItem key={item.href}>
              <Link
                color="foreground"
                data-active={pathname === item.href}
                className={clsx(getColorClass(item.href, pathname === item.href))}
                href={item.href === "/logout" ? "#" : item.href}
                size="lg"
                onPress={async () => {
                  if (item.href === "/logout") {
                    await logout();
                    router.push("/auth/login");
                  }
                }}
              >
                {t(`navbar.${item.label.toLowerCase().replace(/\s+/g, "")}`)}
              </Link>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="hidden lg:flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="hidden sm:flex gap-2">
          <LanguageSwitch />
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
      </NavbarContent>

      <NavbarContent className="lg:hidden basis-1 pl-4" justify="end">
        <LanguageSwitch />
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {filteredNavMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color="foreground"
                data-active={pathname === item.href}
                className={clsx(getColorClass(item.href, pathname === item.href))}
                href={item.href === "/logout" ? "#" : item.href}
                size="lg"
                onPress={async () => {
                  if (item.href === "/logout") {
                    await logout();
                    router.push("/auth/login");
                  }
                }}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
