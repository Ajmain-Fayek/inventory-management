"use client";

import { useEffect, useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { motion } from "framer-motion";
import {
  Settings,
  Users,
  MessageSquare,
  Database,
  List,
  CheckCircle,
  BarChart3,
  GripVertical,
  Plus,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { GlobalToolbar } from "@/components/global-toolbar";
import { useParams, useRouter } from "next/navigation";
import { inventoryService } from "@/services/inventory.service";
import { getInventoryColumns } from "./_helper";
import { useInventory } from "@/context/InventoryContext";

export default function InventoryPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const router = useRouter();
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
  } = useInventory();
  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const getInventories = async () => {
      const [inventory, _items] = await Promise.all([
        inventoryService.getInventoryById(id as string),
        inventoryService.getInvItems(id as string, itemPage, itemRecordLimit),
      ]);

      const { data, meta } = await _items;
      const customCols = await getInventoryColumns(inventory.data);
      setInventoryColumns(customCols);
      setInventory(inventory.data);
      setItems(data);
      setTotalItems(meta.total);
      console.log(_items);
      setLoading(false);

      return;
    };
    getInventories();
  }, [itemRecordLimit, itemPage]);

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        {loading ? (
          <div>Loading Inventory...</div>
        ) : (
          <>
            <h1 className="text-3xl font-bold">
              Inventory:{" "}
              {inventory?.title
                .split(" ")
                .map((a) => a[0].toUpperCase() + a.slice(1, a.length))
                .join(" ")}
            </h1>
            <p className="text-default-500">{inventory?.description}</p>
          </>
        )}
      </motion.div>

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
              onAdd={() => router.push(`/inventory/${params.id}/item/create`)}
              onEdit={() => {
                if (selectedItemKeys.size === 1)
                  router.push(`/inventory/${params.id}/item/${Array.from(selectedItemKeys)[0]}`);
              }}
              onDelete={() => console.log("Delete items", Array.from(selectedItemKeys))}
              isEditDisabled={selectedItemKeys.size !== 1}
              isDeleteDisabled={selectedItemKeys.size === 0}
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
                  <SelectItem key="25">25</SelectItem>
                  <SelectItem key="50">50</SelectItem>
                  <SelectItem key="100">100</SelectItem>
                </Select>
              </div>
            </div>
            {loading ? (
              <div>Loading Items...</div>
            ) : (
              <Table
                selectionMode="multiple"
                onSelectionChange={(keys) =>
                  setSelectedItemKeys(new Set(Array.from(keys) as string[]))
                }
              >
                <TableHeader>
                  <TableColumn>CUSTOM ID</TableColumn>

                  {inventoryColumns.map((col: string) => (
                    <TableColumn key={col}>{inventory[`${col}`]}</TableColumn>
                  ))}
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="cursor-pointer">
                      <TableCell className="font-mono">{item.id}</TableCell>

                      {inventoryColumns.map((col) => (
                        <TableCell key={col + "kjsd"}>{"abc"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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

        {/* SETTINGS TAB */}
        <Tab
          key="settings"
          title={
            <div className="flex items-center gap-2">
              <Settings size={18} />
              <span>General Settings</span>
            </div>
          }
        >
          <div className="pt-4 w-full max-w-4xl flex flex-col gap-6">
            <Input
              label="Title"
              defaultValue="Office Hardware"
              variant="bordered"
              className="w-full"
            />
            <Textarea
              label="Description"
              defaultValue="Laptops, monitors, and peripherals"
              variant="bordered"
              className="w-full"
            />
            <Select
              label="Category"
              defaultSelectedKeys={["1"]}
              variant="bordered"
              className="w-full"
            >
              <SelectItem key="1">Equipment</SelectItem>
              <SelectItem key="2">Furniture</SelectItem>
              <SelectItem key="3">Books</SelectItem>
            </Select>
            <Input
              label="Tags"
              placeholder="Type and press enter or comma to add tags"
              variant="bordered"
              className="w-full"
            />
            <Button color="primary" className="self-end mt-4">
              Save Changes
            </Button>
          </div>
        </Tab>

        {/* CUSTOM IDs TAB */}
        <Tab
          key="custom_ids"
          title={
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              <span>Custom ID</span>
            </div>
          }
        >
          <div className="pt-4 max-w-4xl flex flex-col gap-6">
            <div>
              <p className="text-sm text-default-500 mb-1">
                You can set up items with inventory numbers in your preferred format.
              </p>
              <p className="text-sm text-default-500 mb-6">
                To create a format, add new elements, edit them, drag to reorder, or drag elements
                out of the form to delete them.
              </p>

              <div className="flex items-center gap-2 mb-8 text-xl">
                <span className="text-default-500">Example:</span>
                <span className="font-mono tracking-wider font-semibold">📚-A7E3A_013_2025</span>
              </div>

              <div className="flex flex-col gap-6">
                {/* Element 1 */}
                <div>
                  <div className="flex items-center gap-4">
                    <Button isIconOnly variant="light" className="text-default-400 min-w-10">
                      <GripVertical size={20} />
                    </Button>
                    <Select
                      className="w-48"
                      variant="bordered"
                      defaultSelectedKeys={["fixed"]}
                      aria-label="Type"
                    >
                      <SelectItem key="fixed">Fixed</SelectItem>
                      <SelectItem key="random">20-bit random</SelectItem>
                      <SelectItem key="sequence">Sequence</SelectItem>
                      <SelectItem key="datetime">Date/time</SelectItem>
                    </Select>
                    <div className="flex-1 flex items-center border border-default-200 rounded-lg bg-content1 px-3 py-1">
                      <Input
                        variant="underlined"
                        defaultValue="📚-"
                        className="flex-1 h-10"
                        aria-label="Value"
                        classNames={{
                          input: "border-none shadow-none",
                          inputWrapper: "border-none shadow-none",
                        }}
                      />
                      <div className="flex items-center gap-2 text-default-400 px-2 border-l border-default-200">
                        <Button isIconOnly variant="light" size="sm" aria-label="Emoji">
                          😀
                        </Button>
                        <Button isIconOnly variant="light" size="sm" aria-label="Help">
                          ?
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-default-400 mt-2 ml-14 pl-2">
                    A piece of unchanging text. E.g., you can use Unicode emoji.
                  </p>
                </div>

                {/* Element 2 */}
                <div>
                  <div className="flex items-center gap-4">
                    <Button isIconOnly variant="light" className="text-default-400 min-w-10">
                      <GripVertical size={20} />
                    </Button>
                    <Select
                      className="w-48"
                      variant="bordered"
                      defaultSelectedKeys={["random"]}
                      aria-label="Type"
                    >
                      <SelectItem key="fixed">Fixed</SelectItem>
                      <SelectItem key="random">20-bit random</SelectItem>
                      <SelectItem key="sequence">Sequence</SelectItem>
                      <SelectItem key="datetime">Date/time</SelectItem>
                    </Select>
                    <div className="flex-1 flex items-center border border-default-200 rounded-lg bg-content1 px-3 py-1">
                      <Input
                        variant="underlined"
                        defaultValue="X5_"
                        className="flex-1 h-10"
                        aria-label="Value"
                        classNames={{
                          input: "border-none shadow-none",
                          inputWrapper: "border-none shadow-none",
                        }}
                      />
                      <div className="flex items-center gap-2 text-default-400 px-2 border-l border-default-200">
                        <Button isIconOnly variant="light" size="sm" aria-label="Help">
                          ?
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-default-400 mt-2 ml-14 pl-2">
                    A random value. E.g., you can format it as a six-digit decimal (D6) or 5-digit
                    hex (X5).
                  </p>
                </div>

                {/* Element 3 */}
                <div>
                  <div className="flex items-center gap-4">
                    <Button isIconOnly variant="light" className="text-default-400 min-w-10">
                      <GripVertical size={20} />
                    </Button>
                    <Select
                      className="w-48"
                      variant="bordered"
                      defaultSelectedKeys={["sequence"]}
                      aria-label="Type"
                    >
                      <SelectItem key="fixed">Fixed</SelectItem>
                      <SelectItem key="random">20-bit random</SelectItem>
                      <SelectItem key="sequence">Sequence</SelectItem>
                      <SelectItem key="datetime">Date/time</SelectItem>
                    </Select>
                    <div className="flex-1 flex items-center border border-default-200 rounded-lg bg-content1 px-3 py-1">
                      <Input
                        variant="underlined"
                        defaultValue="D3_"
                        className="flex-1 h-10"
                        aria-label="Value"
                        classNames={{
                          input: "border-none shadow-none",
                          inputWrapper: "border-none shadow-none",
                        }}
                      />
                      <div className="flex items-center gap-2 text-default-400 px-2 border-l border-default-200">
                        <Button isIconOnly variant="light" size="sm" aria-label="Help">
                          ?
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-default-400 mt-2 ml-14 pl-2">
                    A sequential index. E.g., you can format it with leading zeros (D4) or without
                    them (D).
                  </p>
                </div>

                {/* Element 4 */}
                <div>
                  <div className="flex items-center gap-4">
                    <Button isIconOnly variant="light" className="text-default-400 min-w-10">
                      <GripVertical size={20} />
                    </Button>
                    <Select
                      className="w-48"
                      variant="bordered"
                      defaultSelectedKeys={["datetime"]}
                      aria-label="Type"
                    >
                      <SelectItem key="fixed">Fixed</SelectItem>
                      <SelectItem key="random">20-bit random</SelectItem>
                      <SelectItem key="sequence">Sequence</SelectItem>
                      <SelectItem key="datetime">Date/time</SelectItem>
                    </Select>
                    <div className="flex-1 flex items-center border border-default-200 rounded-lg bg-content1 px-3 py-1">
                      <Input
                        variant="underlined"
                        defaultValue="yyyy"
                        className="flex-1 h-10"
                        aria-label="Value"
                        classNames={{
                          input: "border-none shadow-none",
                          inputWrapper: "border-none shadow-none",
                        }}
                      />
                      <div className="flex items-center gap-2 text-default-400 px-2 border-l border-default-200">
                        <Button isIconOnly variant="light" size="sm" aria-label="Help">
                          ?
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-default-400 mt-2 ml-14 pl-2">
                    An item creation date and time. E.g., you can use an abbreviated day of the week
                    (ddd).
                  </p>
                </div>
              </div>

              <div className="mt-8 ml-14">
                <Button
                  color="secondary"
                  variant="bordered"
                  className="border-secondary text-secondary font-semibold px-8"
                  startContent={<Plus size={18} />}
                >
                  Add element
                </Button>
              </div>
            </div>
          </div>
        </Tab>

        {/* CUSTOM FIELDS TAB */}
        <Tab
          key="fields"
          title={
            <div className="flex items-center gap-2">
              <Database size={18} />
              <span>Custom Fields</span>
            </div>
          }
        >
          <div className="pt-4 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Fields Definition</h3>
              <Button size="sm" color="primary" startContent={<Plus size={16} />}>
                New Field
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              {/* Example fields manually listed for UI demo */}
              <div className="flex items-center gap-4 bg-content2 p-4 rounded-lg border border-default-200">
                <GripVertical className="text-default-400 cursor-grab" />
                <div className="flex-1">
                  <p className="font-bold">Condition</p>
                  <p className="text-xs text-default-500">Single-line text</p>
                </div>
                <Switch defaultSelected size="sm">
                  Show in Table
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
                  Show in Table
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
              <span>Access</span>
            </div>
          }
        >
          <div className="pt-4 max-w-4xl flex flex-col gap-6">
            <div className="flex items-center justify-between p-4 bg-content2 rounded-lg border border-default-200">
              <div>
                <h4 className="font-bold">Public Inventory</h4>
                <p className="text-sm text-default-500">
                  Allow any authenticated user to add items.
                </p>
              </div>
              <Switch color="success" />
            </div>

            <div>
              <h4 className="font-bold mb-2">Users with Write Access</h4>
              <Input
                placeholder="Type username or email to add..."
                variant="bordered"
                className="mb-4"
              />
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center p-3 bg-default-100 rounded-md">
                  <span>bob@example.com</span>
                  <Button size="sm" color="danger" variant="flat">
                    Remove
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
