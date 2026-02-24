"use client";

import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Tabs, Tab } from "@heroui/tabs";
import { motion } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Settings,
  CheckCircle,
  Database,
  Users,
  Plus,
  GripVertical,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateInventoryPage() {
  const router = useRouter();

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
            <h1 className="text-2xl font-bold">Create New Inventory</h1>
            <p className="text-default-500">Set up properties and access</p>
          </div>
        </div>

        <Button color="primary" startContent={<Save size={18} />}>
          Save Inventory
        </Button>
      </motion.div>

      <Tabs aria-label="Inventory Options" color="primary" variant="underlined">
        {/* SETTINGS TAB */}
        <Tab
          key="settings"
          title={
            <div className="flex items-center justify-center gap-2">
              <Settings size={18} />
              <span>General Settings</span>
            </div>
          }
        >
          <div className="pt-4 max-w-4xl flex flex-col gap-6">
            <div className="flex flex-col gap-6">
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
            </div>
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
            <div className="flex flex-col gap-4 w-full">
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
                placeholder="Type userId or email to add..."
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
