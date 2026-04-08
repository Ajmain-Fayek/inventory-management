"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { User as UserIcon, Book, Building, Laptop } from "lucide-react";
import { GlobalToolbar } from "@/components/global-toolbar";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Chip } from "@heroui/chip";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { userService } from "@/services/user.service";
import { inventoryService } from "@/services/inventory.service";
import { getErrorMessage } from "@/utils/errorParser";

type ProfileInventory = {
  id: string;
  title: string;
  categoryName: string | null;
  itemCount: number;
  isPublic: boolean;
  creator?: string;
};

const ICONS = [Laptop, Book, Building];

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [myInventories, setMyInventories] = useState<ProfileInventory[]>([]);
  const [writeAccessInventories, setWriteAccessInventories] = useState<ProfileInventory[]>([]);
  const [myFilter, setMyFilter] = useState("");
  const [accessFilter, setAccessFilter] = useState("");
  const [mySortBy, setMySortBy] = useState<"title" | "category">("title");
  const [accessSortBy, setAccessSortBy] = useState<"title" | "category" | "owner">("title");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await userService.getProfileData();
      setMyInventories(response.data.ownedInventories ?? []);
      setWriteAccessInventories(response.data.writeAccessInventories ?? []);
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
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

  const filteredMyInventories = [...myInventories]
    .filter((inv) => {
      const q = myFilter.trim().toLowerCase();
      if (!q) return true;
      return (
        inv.title.toLowerCase().includes(q) ||
        (inv.categoryName ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (mySortBy === "category") {
        return (a.categoryName ?? "").localeCompare(b.categoryName ?? "");
      }
      return a.title.localeCompare(b.title);
    });

  const filteredAccessInventories = [...writeAccessInventories]
    .filter((inv) => {
      const q = accessFilter.trim().toLowerCase();
      if (!q) return true;
      return (
        inv.title.toLowerCase().includes(q) ||
        (inv.categoryName ?? "").toLowerCase().includes(q) ||
        (inv.creator ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (accessSortBy === "category") {
        return (a.categoryName ?? "").localeCompare(b.categoryName ?? "");
      }
      if (accessSortBy === "owner") {
        return (a.creator ?? "").localeCompare(b.creator ?? "");
      }
      return a.title.localeCompare(b.title);
    });

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
          <h1 className="text-3xl font-bold">{user?.name ?? "User"}</h1>
          <p className="text-default-500">{user?.email ?? ""}</p>
        </div>
      </motion.div>
      {error && <div className="px-3 py-2 rounded-md bg-danger-50 text-danger-700">{error}</div>}
      {loading && <div className="text-default-500">Loading profile...</div>}

      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlobalToolbar
          title="Inventories I Own"
          onAdd={() => router.push("/inventory/create")}
          onEdit={() => {
            if (selectedMyInvKeys.size === 1) {
              router.push(`/inventory/${Array.from(selectedMyInvKeys)[0]}/update-inventory`);
            }
          }}
          onDelete={async () => {
            if (selectedMyInvKeys.size === 0) return;
            try {
              await Promise.all(
                Array.from(selectedMyInvKeys).map((id) => inventoryService.deleteInventory(id)),
              );
              setSelectedMyInvKeys(new Set());
              await loadProfile();
            } catch (err) {
              setError(getErrorMessage(err));
            }
          }}
          isEditDisabled={selectedMyInvKeys.size !== 1}
          isDeleteDisabled={selectedMyInvKeys.size === 0}
        />
        <div className="mb-3 flex gap-2">
          <input
            className="border border-default-300 rounded-md px-2 py-1 text-sm w-full"
            placeholder="Filter by title or category"
            value={myFilter}
            onChange={(e) => setMyFilter(e.target.value)}
          />
          <select
            className="border border-default-300 rounded-md px-2 py-1 text-sm"
            value={mySortBy}
            onChange={(e) => setMySortBy(e.target.value as "title" | "category")}
          >
            <option value="title">Sort: Title</option>
            <option value="category">Sort: Category</option>
          </select>
        </div>
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
            {filteredMyInventories.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = ICONS[Number(inv.id.replace(/\D/g, "")) % ICONS.length] ?? Laptop;
                      return <Icon size={18} className="text-primary" />;
                    })()}
                    <span className="font-semibold">{inv.title}</span>
                  </div>
                </TableCell>
                <TableCell>{inv.categoryName ?? "N/A"}</TableCell>
                <TableCell className="font-mono">{inv.itemCount}</TableCell>
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
        <div className="mb-3 flex gap-2">
          <input
            className="border border-default-300 rounded-md px-2 py-1 text-sm w-full"
            placeholder="Filter by title, category, or owner"
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
          />
          <select
            className="border border-default-300 rounded-md px-2 py-1 text-sm"
            value={accessSortBy}
            onChange={(e) => setAccessSortBy(e.target.value as "title" | "category" | "owner")}
          >
            <option value="title">Sort: Title</option>
            <option value="category">Sort: Category</option>
            <option value="owner">Sort: Owner</option>
          </select>
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
            {filteredAccessInventories.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = ICONS[Number(inv.id.replace(/\D/g, "")) % ICONS.length] ?? Book;
                      return <Icon size={18} className="text-secondary" />;
                    })()}
                    <span className="font-semibold">{inv.title}</span>
                  </div>
                </TableCell>
                <TableCell>{inv.categoryName ?? "N/A"}</TableCell>
                <TableCell className="font-mono">{inv.itemCount}</TableCell>
                <TableCell>{inv.creator ?? "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.section>
    </div>
  );
}
