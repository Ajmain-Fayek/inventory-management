"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { inventoryService } from "@/services/inventory.service";
import InventorySkeleton from "@/components/inventorySkeleton";
import { GlobalToolbar } from "@/components/global-toolbar";
import { useInventory } from "@/context/InventoryContext";
import { useLanguage } from "@/context/LanguageContext";
import { Select, SelectItem } from "@heroui/select";
import { Pagination } from "@heroui/pagination";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Chip } from "@heroui/chip";

export default function AllInventoriesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const {
    allInventories,
    setAllInventoris,
    invRecordLimit,
    setInvRecordLimit,
    setInvPage,
    invPage,
    invTotalPages,
    setInvTotalPages,
    setTotalInventories,
    totalInventories,
  } = useInventory();
  const [loading, setLoading] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const getInventories = async () => {
    setError("");
    const result = await inventoryService.getInventories(invPage, invRecordLimit);
    if (result && !result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }
    const { data, meta } = await result;
    setAllInventoris(data);
    setInvTotalPages(meta.totalPages);
    setInvRecordLimit(meta.limit);
    setInvPage(meta.page);
    setTotalInventories(meta.total);
    setLoading(false);
    return;
  };

  useEffect(() => {
    getInventories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invRecordLimit, invPage]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectionChange = (keys: any) => {
    setSelectedKeys(new Set(Array.from(keys) as string[]));
  };

  const handleRowAction = (key: React.Key) => {
    router.push(`/inventory/${key}`);
  };

  if (loading) {
    return <InventorySkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 py-8 px-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {t("inventories.header")}
        </h1>
        <p className="text-default-500 mt-2">{t("inventories.subheader")}</p>
      </motion.div>

      {error && <div className="bg-red-50 text-red-500 rounded-2xl px-4 py-2">{error}</div>}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlobalToolbar
          title={t("inventories.table.title")}
          onAdd={() => router.push("/inventory/create")}
          onEdit={() => console.log("Edit Inventories", Array.from(selectedKeys))}
          onDelete={() => console.log("Delete Inventories", Array.from(selectedKeys))}
          isEditDisabled={selectedKeys.size !== 1}
          isDeleteDisabled={selectedKeys.size === 0}
        />

        {/* Filters and Rows Per Page Header */}
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="text-sm text-default-500">Total Records: {totalInventories}</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-default-500">{t("inventories.table.rowsPerPage")}</span>
            <Select
              size="sm"
              className="w-24"
              variant="bordered"
              selectedKeys={[String(invRecordLimit)]}
              onChange={(e) => {
                setInvRecordLimit(Number(e.target.value));
                setInvPage(1);
              }}
              aria-label="Record per page"
            >
              <SelectItem key="15">15</SelectItem>
              <SelectItem key="25">25</SelectItem>
              <SelectItem key="50">50</SelectItem>
            </Select>
          </div>
        </div>

        <Table
          aria-label="All Inventories Paginated Table"
          className="shadow-lg"
          selectionMode="multiple"
          onSelectionChange={handleSelectionChange}
          onRowAction={handleRowAction}
          bottomContent={
            invTotalPages > 0 ? (
              <div className="flex w-full justify-center mt-4">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={invPage}
                  total={invTotalPages}
                  onChange={(page) => setInvPage(page)}
                />
              </div>
            ) : null
          }
        >
          <TableHeader>
            <TableColumn>INVENTORY</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>TAGS</TableColumn>
            <TableColumn>AUTHOR</TableColumn>
            <TableColumn>TYPE</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"No inventories found"}>
            {allInventories.map((inv) => (
              <TableRow
                key={inv.id}
                className="cursor-pointer hover:bg-default-100/50 transition-colors"
                title={inv.description}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FolderIcon size={18} className="text-primary" />
                    <span className="font-semibold">{inv.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="dot" color="secondary">
                    {inv.categoryName}
                  </Chip>
                </TableCell>
                <TableCell className="font-mono text-default-600">
                  <div className="flex gap-1">
                    {inv.inventoryTags.map((a: string) => (
                      <span
                        key={a}
                        className="border border-default bg-default-100/75 rounded-full px-2 text-sm"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{inv.creator}</TableCell>
                <TableCell>
                  <Chip size="sm" color={inv.isPublic ? "success" : "default"} variant="flat">
                    {inv.isPublic ? "Public" : "Private"}
                  </Chip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.section>
    </div>
  );
}
