"use client";

import { inventoryService } from "@/services/inventory.service";
import { useLanguage } from "@/context/LanguageContext";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { Tooltip } from "@heroui/tooltip";
import { motion } from "framer-motion";
import { FolderIcon, StarIcon, TagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/utils/errorParser";

type InventoryRow = {
  id: string;
  title: string;
  description?: string;
  categoryName?: string;
  creator: string;
  createdAt: string;
  itemCount?: number;
  inventoryTags: string[];
};

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();
  const [inventories, setInventories] = useState<InventoryRow[]>([]);
  const [error, setError] = useState("");

  const handleRowAction = (key: React.Key) => {
    router.push(`/inventory/${key}`);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const response = await inventoryService.getInventories(1, 50);
        setInventories(response.data ?? []);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };

    load();
  }, []);

  const latestInventories = useMemo(
    () =>
      [...inventories]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 10),
    [inventories],
  );

  const popularInventories = useMemo(
    () => [...inventories].sort((a, b) => (b.itemCount ?? 0) - (a.itemCount ?? 0)).slice(0, 5),
    [inventories],
  );

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const inv of inventories) {
      for (const tag of inv.inventoryTags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [inventories]);

  return (
    <div className="flex flex-col px-4 gap-10 py-8">
      {error && <div className="bg-danger-50 text-danger-700 rounded-md px-3 py-2">{error}</div>}
      {/* Latest Inventories */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FolderIcon className="text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t("home.latest")}
          </h2>
        </div>
        <Table aria-label="Latest Inventories Table" className="shadow-lg" onRowAction={handleRowAction}>
          <TableHeader>
            <TableColumn>INVENTORY</TableColumn>
            <TableColumn>DESCRIPTION</TableColumn>
            <TableColumn>CREATOR</TableColumn>
            <TableColumn>DATE</TableColumn>
          </TableHeader>
          <TableBody>
            {latestInventories.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer hover:bg-default-100/50 transition-colors">
                <TableCell className="font-semibold">{inv.title}</TableCell>
                <TableCell className="text-default-500">{inv.description ?? "N/A"}</TableCell>
                <TableCell>
                  <User
                    name={inv.creator}
                    avatarProps={{ src: `https://i.pravatar.cc/150?u=${inv.creator}`, size: "sm" }}
                  />
                </TableCell>
                <TableCell className="text-default-400">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Popular Inventories */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <StarIcon className="text-warning" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-warning to-danger bg-clip-text text-transparent">
              {t("home.popular")}
            </h2>
          </div>
          <Table aria-label="Popular Inventories Table" className="shadow-lg" onRowAction={handleRowAction}>
            <TableHeader>
              <TableColumn>INVENTORY</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>ITEMS</TableColumn>
              <TableColumn>CREATOR</TableColumn>
            </TableHeader>
            <TableBody>
              {popularInventories.map((inv) => (
                <TableRow key={inv.id} className="cursor-pointer hover:bg-default-100/50 transition-colors">
                  <TableCell className="font-semibold">{inv.title}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="dot" color="primary">{inv.categoryName ?? "N/A"}</Chip>
                  </TableCell>
                  <TableCell className="font-mono">{(inv.itemCount ?? 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <User
                      name={inv.creator}
                      avatarProps={{ src: `https://i.pravatar.cc/150?u=${inv.creator}`, size: "sm" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.section>

        {/* Tag Cloud */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-default-50/50 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-6">
            <TagIcon className="text-secondary" />
            <h2 className="text-2xl font-bold text-default-800">
              {t("home.tags")}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Tooltip key={tag.name} content={`${tag.count} inventories`}>
                <Chip
                  className="cursor-pointer hover:scale-105 transition-transform"
                  variant="flat"
                  color={tag.count > 10 ? "secondary" : "default"}
                  size={tag.count > 10 ? "lg" : tag.count > 5 ? "md" : "sm"}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(tag.name)}`)}
                >
                  {tag.name}
                </Chip>
              </Tooltip>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
