"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, FolderIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { Suspense, useEffect, useMemo, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/utils/errorParser";

type InventoryRow = {
  id: string;
  title: string;
  description?: string;
  categoryName?: string;
  creator: string;
  inventoryTags: string[];
};

type ItemRow = {
  id: string;
  customId: string;
  inventoryId: string;
  inventoryTitle: string;
  createdAt: string;
};

export default function SearchResultsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsPage />
    </Suspense>
  );
}

function SearchResultsPage() {
  // const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inventories, setInventories] = useState<InventoryRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [error, setError] = useState("");

  const query = searchParams?.get("q") || "";

  const handleRowAction = (key: React.Key) => {
    router.push(`/inventory/${key}`);
  };

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const response = await axiosInstance.get("/api/v1/search", { params: { q: query } });
        setInventories(response.data?.data?.inventories ?? []);
        setItems(response.data?.data?.items ?? []);
      } catch (err) {
        setError(getErrorMessage(err));
        setInventories([]);
        setItems([]);
      }
    };

    load();
  }, [query]);

  return (
    <div className="flex flex-col gap-10 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
          <Search size={32} />
        </div>
        <h1 className="text-3xl font-bold">
          Search Results for <span className="text-primary">&quot;{query}&quot;</span>
        </h1>
        <p className="text-default-500">
          Found {inventories.length} inventories and {items.length} items matching your current query.
        </p>
        {error && <div className="bg-danger-50 text-danger-700 rounded-md px-3 py-2">{error}</div>}
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full"
      >
        <h2 className="text-xl font-bold mb-3">Items</h2>
        <Table aria-label="Item Search Results Table" className="shadow-lg" onRowAction={(key) => {
          const found = items.find((it) => it.id === String(key));
          if (found) router.push(`/inventory/${found.inventoryId}/item/${found.id}`);
        }}>
          <TableHeader>
            <TableColumn>CUSTOM ID</TableColumn>
            <TableColumn>INVENTORY</TableColumn>
            <TableColumn>CREATED</TableColumn>
          </TableHeader>
          <TableBody items={items} emptyContent={"No items found"}>
            {(it) => (
              <TableRow key={it.id} className="cursor-pointer hover:bg-default-100/50 transition-colors">
                <TableCell className="font-mono">{it.customId}</TableCell>
                <TableCell className="font-semibold">{it.inventoryTitle}</TableCell>
                <TableCell className="text-default-500">{new Date(it.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <h2 className="text-xl font-bold mb-3">Inventories</h2>
        <Table
          aria-label="Search Results Table"
          className="shadow-lg"
          selectionMode="multiple"
          onRowAction={handleRowAction}
        >
          <TableHeader>
            <TableColumn>INVENTORY</TableColumn>
            <TableColumn>DESCRIPTION</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>MATCH CONTEXT</TableColumn>
            <TableColumn>CREATOR</TableColumn>
          </TableHeader>
          <TableBody>
            {inventories.map((inv) => (
              <TableRow
                key={inv.id}
                className="cursor-pointer hover:bg-default-100/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FolderIcon size={18} className="text-primary" />
                    <span className="font-semibold">{inv.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-default-500">{inv.description ?? "N/A"}</TableCell>
                <TableCell>
                  <Chip size="sm" variant="dot" color="secondary">
                    {inv.categoryName ?? "N/A"}
                  </Chip>
                </TableCell>
                <TableCell className="text-xs text-default-400 italic">
                  Matches title/description/category/tags/creator
                </TableCell>
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
    </div>
  );
}
