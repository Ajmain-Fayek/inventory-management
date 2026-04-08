"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { ShieldAlert, ShieldCheck, Ban, CheckCircle, FolderIcon } from "lucide-react";
import { GlobalToolbar } from "@/components/global-toolbar";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import { Chip } from "@heroui/chip";
import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import { inventoryService } from "@/services/inventory.service";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/utils/errorParser";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "BLOCKED";
  role: "ADMIN" | "USER";
};

type AdminInventory = {
  id: string;
  title: string;
  categoryName: string | null;
  itemCount: number;
  creator: string;
  isPublic: boolean;
};

export default function AdminPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [usersData, setUsersData] = useState<AdminUser[]>([]);
  const [allInventoriesData, setAllInventoriesData] = useState<AdminInventory[]>([]);
  const [selectedUserKeys, setSelectedUserKeys] = useState<Set<string>>(new Set());
  const [selectedInvKeys, setSelectedInvKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  const handleRowAction = (key: React.Key) => {
    router.push(`/inventory/${key}`);
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await userService.getAdminDashboardData();
      setUsersData(response.data.users ?? []);
      setAllInventoriesData(response.data.inventories ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/");
      return;
    }
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

  const applyUserAction = async (
    action: "BLOCK" | "UNBLOCK" | "MAKE_ADMIN" | "REMOVE_ADMIN" | "DELETE",
  ) => {
    if (selectedUserKeys.size === 0) return;
    setError("");
    try {
      await userService.updateUsersByAdmin(Array.from(selectedUserKeys), action);
      setSelectedUserKeys(new Set());
      await loadDashboard();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteInventories = async () => {
    if (selectedInvKeys.size === 0) return;
    setError("");
    try {
      await Promise.all(
        Array.from(selectedInvKeys).map((id) => inventoryService.deleteInventory(id)),
      );
      setSelectedInvKeys(new Set());
      await loadDashboard();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-10 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-danger to-warning bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-default-500 mt-2">Manage users and oversee all inventories globally.</p>
      </motion.div>
      {error && <div className="px-3 py-2 rounded-md bg-danger-50 text-danger-700">{error}</div>}
      {loading && <div className="text-default-500">Loading dashboard...</div>}

      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlobalToolbar
          title="User Management"
          onDelete={() => applyUserAction("DELETE")}
          isDeleteDisabled={selectedUserKeys.size === 0}
        >
          {/* Custom Admin Actions */}
          <Button
            isDisabled={selectedUserKeys.size === 0}
            color="warning"
            variant="flat"
            startContent={<Ban size={16} />}
            onPress={() => applyUserAction("BLOCK")}
          >
            Block
          </Button>
          <Button
            isDisabled={selectedUserKeys.size === 0}
            color="success"
            variant="flat"
            startContent={<CheckCircle size={16} />}
            onPress={() => applyUserAction("UNBLOCK")}
          >
            Unblock
          </Button>
          <Button
            isDisabled={selectedUserKeys.size === 0}
            color="secondary"
            variant="flat"
            startContent={<ShieldCheck size={16} />}
            onPress={() => applyUserAction("MAKE_ADMIN")}
          >
            Make Admin
          </Button>
          <Button
            isDisabled={selectedUserKeys.size === 0}
            color="default"
            variant="flat"
            startContent={<ShieldAlert size={16} />}
            onPress={() => applyUserAction("REMOVE_ADMIN")}
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
                    color={user.role === "ADMIN" ? "secondary" : "default"}
                    variant="flat"
                  >
                    {user.role}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={user.status === "ACTIVE" ? "success" : "danger"}
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
          onDelete={handleDeleteInventories}
          isEditDisabled
          isDeleteDisabled={selectedInvKeys.size === 0}
        />
        <Table
          aria-label="All Inventories Table"
          selectionMode="multiple"
          color="warning"
          onSelectionChange={handleInvSelectionChange}
          className="shadow-lg mt-4"
          onRowAction={handleRowAction}
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
                    <span className="font-semibold">{inv.title}</span>
                  </div>
                </TableCell>
                <TableCell>{inv.categoryName ?? "N/A"}</TableCell>
                <TableCell className="font-mono">{inv.itemCount}</TableCell>
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
