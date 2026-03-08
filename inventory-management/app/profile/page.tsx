"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { User as UserIcon, Book, Building, Laptop } from "lucide-react";
import { GlobalToolbar } from "@/components/global-toolbar";
// import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Chip } from "@heroui/chip";
import { useState } from "react";

const myInventories = [
  {
    id: "1",
    name: "Personal Devices",
    category: "Hardware",
    items: 4,
    isPublic: false,
    icon: Laptop,
  },
  { id: "2", name: "Book Collection", category: "Books", items: 120, isPublic: true, icon: Book },
];

const writeAccessInventories = [
  {
    id: "3",
    name: "Office Hardware 2026",
    category: "Hardware",
    items: 45,
    owner: "Alice Smith",
    icon: Building,
  },
  {
    id: "4",
    name: "Central Library",
    category: "Books",
    items: 8900,
    owner: "Carol White",
    icon: Book,
  },
];

export default function ProfilePage() {
  // const { t } = useLanguage();
  const router = useRouter();

  const [selectedMyInvKeys, setSelectedMyInvKeys] = useState<Set<string>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAccessInvKeys, setSelectedAccessInvKeys] = useState<Set<string>>(new Set());

  const handleRowAction = (key: React.Key) => {
    router.push(`/inventory/${key}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMyInvSelectionChange = (keys: any) => {
    setSelectedMyInvKeys(new Set(Array.from(keys) as string[]));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAccessInvSelectionChange = (keys: any) => {
    setSelectedAccessInvKeys(new Set(Array.from(keys) as string[]));
  };

  return (
    <div className="flex flex-col gap-10 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 border-b border-default-200 pb-8"
      >
        <div className="w-20 h-20 rounded-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg">
          <UserIcon size={40} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">John Doe</h1>
          <p className="text-default-500">john.doe@example.com</p>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlobalToolbar
          title="Inventories I Own"
          onAdd={() => console.log("Add clicked")}
          onEdit={() => console.log("Edit clicked", Array.from(selectedMyInvKeys))}
          onDelete={() => console.log("Delete clicked", Array.from(selectedMyInvKeys))}
          isEditDisabled={selectedMyInvKeys.size !== 1}
          isDeleteDisabled={selectedMyInvKeys.size === 0}
        />
        <Table
          aria-label="My Inventories"
          selectionMode="multiple"
          color="primary"
          onSelectionChange={handleMyInvSelectionChange}
          onRowAction={handleRowAction}
          className="shadow-lg mt-4"
        >
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>ITEMS</TableColumn>
            <TableColumn>VISIBILITY</TableColumn>
          </TableHeader>
          <TableBody>
            {myInventories.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <inv.icon size={18} className="text-primary" />
                    <span className="font-semibold">{inv.name}</span>
                  </div>
                </TableCell>
                <TableCell>{inv.category}</TableCell>
                <TableCell className="font-mono">{inv.items}</TableCell>
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

      <motion.section
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <div className="mb-4">
          <h2 className="text-xl font-bold text-default-800 border-b border-default-200 pb-4">
            Inventories with Write Access
          </h2>
        </div>
        <Table
          aria-label="Write Access Inventories"
          selectionMode="multiple"
          color="secondary"
          onSelectionChange={handleAccessInvSelectionChange}
          onRowAction={handleRowAction}
          className="shadow-lg"
        >
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>ITEMS</TableColumn>
            <TableColumn>OWNER</TableColumn>
          </TableHeader>
          <TableBody>
            {writeAccessInventories.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <inv.icon size={18} className="text-secondary" />
                    <span className="font-semibold">{inv.name}</span>
                  </div>
                </TableCell>
                <TableCell>{inv.category}</TableCell>
                <TableCell className="font-mono">{inv.items}</TableCell>
                <TableCell>{inv.owner}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.section>
    </div>
  );
}
