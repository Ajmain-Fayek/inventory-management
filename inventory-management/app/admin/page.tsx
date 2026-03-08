"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { ShieldAlert, ShieldCheck, Ban, CheckCircle, FolderIcon } from "lucide-react";
import { GlobalToolbar } from "@/components/global-toolbar";
// import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import { Chip } from "@heroui/chip";
import { useState } from "react";

const usersData = [
  { id: "1", name: "Alice Smith", email: "alice@example.com", status: "Active", role: "Admin" },
  { id: "2", name: "Bob Jones", email: "bob@example.com", status: "Blocked", role: "User" },
  { id: "3", name: "Carol White", email: "carol@example.com", status: "Active", role: "User" },
];

const allInventoriesData = [
  {
    id: "1",
    name: "Corporate Fleet",
    category: "Transport",
    items: 120,
    owner: "Admin System",
    isPublic: true,
  },
  {
    id: "2",
    name: "Confidential Documents",
    category: "HR",
    items: 450,
    owner: "Alice Smith",
    isPublic: false,
  },
];

export default function AdminPage() {
  // const { t } = useLanguage();
  const [selectedUserKeys, setSelectedUserKeys] = useState<Set<string>>(new Set());
  const [selectedInvKeys, setSelectedInvKeys] = useState<Set<string>>(new Set());

  type Key = string | number;
  type Selection = Set<Key> | Key;

  const handleUserSelectionChange = (keys: Selection) => {
    setSelectedUserKeys(
      keys instanceof Set ? new Set(Array.from(keys).map(String)) : new Set([String(keys)]),
    );
  };

  const handleInvSelectionChange = (keys: Selection) => {
    setSelectedInvKeys(
      keys instanceof Set ? new Set(Array.from(keys).map(String)) : new Set([String(keys)]),
    );
  };

  return (
    <div className="flex flex-col gap-10 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-danger to-warning bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-default-500 mt-2">Manage users and oversee all inventories globally.</p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlobalToolbar
          title="User Management"
          onDelete={() => console.log("Delete Users", Array.from(selectedUserKeys))}
          isDeleteDisabled={selectedUserKeys.size === 0}
        >
          {/* Custom Admin Actions */}
          <Button
            isDisabled={selectedUserKeys.size === 0}
            color="warning"
            variant="flat"
            startContent={<Ban size={16} />}
          >
            Block
          </Button>
          <Button
            isDisabled={selectedUserKeys.size === 0}
            color="success"
            variant="flat"
            startContent={<CheckCircle size={16} />}
          >
            Unblock
          </Button>
          <Button
            isDisabled={selectedUserKeys.size === 0}
            color="secondary"
            variant="flat"
            startContent={<ShieldCheck size={16} />}
          >
            Make Admin
          </Button>
          <Button
            isDisabled={selectedUserKeys.size === 0}
            color="default"
            variant="flat"
            startContent={<ShieldAlert size={16} />}
          >
            Remove Admin
          </Button>
        </GlobalToolbar>

        <Table
          aria-label="User Management Table"
          selectionMode="multiple"
          color="danger"
          onSelectionChange={handleUserSelectionChange}
          className="shadow-lg mt-4"
        >
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>EMAIL</TableColumn>
            <TableColumn>ROLE</TableColumn>
            <TableColumn>STATUS</TableColumn>
          </TableHeader>
          <TableBody>
            {usersData.map((user) => (
              <TableRow key={user.id} className="cursor-pointer">
                <TableCell className="font-semibold">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={user.role === "Admin" ? "secondary" : "default"}
                    variant="flat"
                  >
                    {user.role}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={user.status === "Active" ? "success" : "danger"}
                    variant="dot"
                  >
                    {user.status}
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
        <GlobalToolbar
          title="All Inventories (Admin View)"
          onEdit={() => console.log("Edit Inventory", Array.from(selectedInvKeys))}
          onDelete={() => console.log("Delete Inventory", Array.from(selectedInvKeys))}
          isEditDisabled={selectedInvKeys.size !== 1}
          isDeleteDisabled={selectedInvKeys.size === 0}
        />
        <Table
          aria-label="All Inventories Table"
          selectionMode="multiple"
          color="warning"
          onSelectionChange={handleInvSelectionChange}
          className="shadow-lg mt-4"
        >
          <TableHeader>
            <TableColumn>INVENTORY</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>ITEMS</TableColumn>
            <TableColumn>OWNER</TableColumn>
            <TableColumn>VISIBILITY</TableColumn>
          </TableHeader>
          <TableBody>
            {allInventoriesData.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FolderIcon size={18} className="text-warning" />
                    <span className="font-semibold">{inv.name}</span>
                  </div>
                </TableCell>
                <TableCell>{inv.category}</TableCell>
                <TableCell className="font-mono">{inv.items}</TableCell>
                <TableCell>{inv.owner}</TableCell>
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
