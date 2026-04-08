"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { getInventoryColumns } from "../_helper.ts/getInventoryColumns";
import { MessageSquare, List, BarChart3, Pencil } from "lucide-react";
import { inventoryService } from "@/services/inventory.service";
import InventorySkeleton from "@/components/inventorySkeleton";
import { GlobalToolbar } from "@/components/global-toolbar";
import { useInventory } from "@/context/InventoryContext";
import { useLanguage } from "@/context/LanguageContext";
import { useParams, useRouter } from "next/navigation";
import { itemService } from "@/services/item.service";
import { getErrorMessage } from "@/utils/errorParser";
import { Select, SelectItem } from "@heroui/select";
import { useEffect, useState } from "react";
import { Textarea } from "@heroui/input";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";

export default function InventoryPage() {
  const {
    inventory,
    setInventory,
    inventoryColumns,
    setInventoryColumns,
    itemPage,
    setItemPage,
    itemRecordLimit,
    setItemRecordLimit,
    totalItems,
    setTotalItems,
    items,
    setItems,
    isLockedByOtherUser,
  } = useInventory();
  const router = useRouter();
  const { id } = useParams();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(new Set());
  const [deletingItems, setDeletingItems] = useState(false);
  const [error, setError] = useState("");

  const getInventories = async () => {
    const [_inventory, _items] = await Promise.all([
      inventoryService.getInventoryById(id as string),
      itemService.getInvItems(id as string, itemPage, itemRecordLimit),
    ]);

    const { data, meta } = await _items;
    const customCols = await getInventoryColumns(_inventory.data);
    setInventoryColumns(customCols);
    setInventory(_inventory.data);
    setItems(data);
    setTotalItems(meta.total);
    setLoading(false);
  };

  console.log(inventory);

  useEffect(() => {
    getInventories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemRecordLimit, itemPage]);

  const handleRowAction = (key: React.Key) => {
    if (items.length === 0) return;
    router.push(`/inventory/${id}/item/${key}`);
  };

  const columns: { key: string; label: string }[] = [
    { key: "customId", label: "CUSTOM ID" },
    ...inventoryColumns
      .filter((col) => col[3] === true)
      .map((col) => ({
        key: col[0],
        label: col[1],
      })),
  ];

  if (loading) {
    return <InventorySkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">
            Inventory:{" "}
            {inventory?.title
              .split(" ")
              .map((a) => a[0].toUpperCase() + a.slice(1, a.length))
              .join(" ")}
          </h1>
          <p className="text-default-500">{inventory?.description}</p>
        </div>
        <Button
          isDisabled={isLockedByOtherUser}
          color="secondary"
          size="sm"
          onPress={() => router.push(`/inventory/${id}/update-inventory`)}
        >
          <Pencil size={18} />
          Edit
        </Button>
      </motion.div>

      {isLockedByOtherUser && (
        <div className="px-2 bg-red-50 text-red-600 text-center w-fit">
          This inventory is currently read-only because another user is editing it. Please try again
          in a few minutes.
        </div>
      )}
      {error && <div className="px-3 py-2 rounded-md bg-danger-50 text-danger-700">{error}</div>}

      <Tabs
        aria-label="Inventory Options"
        color="primary"
        variant="underlined"
        classNames={{ cursor: "w-full" }}
      >
        {/* ITEMS TAB */}
        <Tab
          key="items"
          title={
            <div className="flex items-center gap-2">
              <List size={18} />
              <span>Items</span>
            </div>
          }
        >
          <div className="pt-4">
            <GlobalToolbar
              title="Inventory Items"
              onAdd={() => router.push(`/inventory/${id}/item/create`)}
              onEdit={() => {
                if (selectedItemKeys.size === 1)
                  router.push(
                    `/inventory/${id}/item/${Array.from(selectedItemKeys)[0]}/update-item`,
                  );
              }}
              onDelete={async () => {
                if (selectedItemKeys.size === 0) return;
                setDeletingItems(true);
                setError("");
                try {
                  await itemService.deleteItems(id as string, Array.from(selectedItemKeys));
                  setSelectedItemKeys(new Set());
                  await getInventories();
                } catch (err) {
                  setError(getErrorMessage(err));
                } finally {
                  setDeletingItems(false);
                }
              }}
              isEditDisabled={inventory?.isInEditMode === true || selectedItemKeys.size !== 1}
              isDeleteDisabled={
                inventory?.isInEditMode === true || selectedItemKeys.size === 0 || deletingItems
              }
              isAddDisabled={inventory?.isInEditMode === true}
            />
            {/* Filters and Rows Per Page Header */}
            <div className="flex justify-between items-center mb-4 gap-4">
              <div className="text-sm text-default-500">Total Records: {totalItems}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-default-500">
                  {t("inventories.table.rowsPerPage")}
                </span>
                <Select
                  size="sm"
                  className="w-24"
                  variant="bordered"
                  selectedKeys={[String(itemRecordLimit)]}
                  onChange={(e) => {
                    setItemRecordLimit(Number(e.target.value));
                    setItemPage(1);
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
              selectionMode="multiple"
              onSelectionChange={(keys) =>
                setSelectedItemKeys(new Set(Array.from(keys) as string[]))
              }
              onRowAction={handleRowAction}
            >
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn key={column.key}>{column.label.toUpperCase()}</TableColumn>
                )}
              </TableHeader>

              <TableBody items={items} emptyContent={"Empty inventory"}>
                {(item) => (
                  <TableRow key={item.id} className="cursor-pointer">
                    {(columnKey) => (
                      <TableCell>
                        {columnKey === "customId" ? (
                          <span className="whitespace-nowrap">{String(item[columnKey])}</span>
                        ) : typeof item[columnKey] === "boolean" ? (
                          item[columnKey] ? (
                            "Yes"
                          ) : (
                            "No"
                          )
                        ) : (
                          String(item[columnKey] ?? "N/A")
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Tab>

        {/* DISCUSSION TAB */}
        <Tab
          key="discussion"
          title={
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              <span>Discussion</span>
            </div>
          }
        >
          <div className="pt-4 w-full max-w-4xl flex flex-col gap-4">
            <div className="p-4 bg-default-100 rounded-lg">
              <p className="font-bold text-sm">
                Alice Smith <span className="text-default-400 font-normal">2 hours ago</span>
              </p>
              <p className="mt-1">Please ensure all laptops are checked out properly.</p>
            </div>
            <div className="flex gap-2">
              <Textarea placeholder="Write a comment... Markdown supported" className="flex-1" />
              <Button color="primary" className="h-auto">
                Post
              </Button>
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
                <p className="text-4xl font-mono mt-2 cursor-pointer">{totalItems}</p>
              </div>
              {/* <div className="bg-secondary/10 p-6 rounded-xl border border-secondary/20 text-center">
                <p className="text-secondary font-bold">Avg. Condition String Length</p>
                <p className="text-4xl font-mono mt-2">12</p>
              </div> */}
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
