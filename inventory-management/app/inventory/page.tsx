"use client";

import { useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { motion } from "framer-motion";
import { FolderIcon, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { GlobalToolbar } from "@/components/global-toolbar";

// Mock data generator for 100+ items to showcase pagination
const generateInventories = (count: number) => {
  const categories = ["Equipment", "Hardware", "Books", "Furniture", "Digital"];
  const creators = ["Alice Smith", "Bob Jones", "Carol White", "Dave Brown"];
  
  return Array.from({ length: count }).map((_, i) => ({
    id: `inv-${i + 1}`,
    name: `Inventory Demo ${i + 1}`,
    category: categories[i % categories.length],
    items: Math.floor(Math.random() * 500) + 10,
    creator: creators[i % creators.length],
    avatar: `https://i.pravatar.cc/150?u=${(i % 10) + 1}`,
    isPublic: Math.random() > 0.3
  }));
};

const allInventories = generateInventories(124);

export default function AllInventoriesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  
  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("25");
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Filter items
  const filteredItems = allInventories.filter((inv) =>
    inv.name.toLowerCase().includes(filterValue.toLowerCase()) ||
    inv.category.toLowerCase().includes(filterValue.toLowerCase()) ||
    inv.creator.toLowerCase().includes(filterValue.toLowerCase())
  );

  const pages = Math.ceil(filteredItems.length / parseInt(rowsPerPage));
  
  // Get items for current page
  const items = filteredItems.slice(
    (page - 1) * parseInt(rowsPerPage),
    page * parseInt(rowsPerPage)
  );

  const handleSelectionChange = (keys: any) => {
    setSelectedKeys(new Set(Array.from(keys) as string[]));
  };

  const handleRowAction = (key: React.Key) => {
    router.push(`/inventory/${key}`);
  };

  return (
    <div className="flex flex-col gap-8 py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Explore Inventories
        </h1>
        <p className="text-default-500 mt-2">Browse the global registry of all shared and public inventories.</p>
      </motion.div>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlobalToolbar 
          title="All Inventories"
          onAdd={() => router.push("/inventory/create")}
          onEdit={() => console.log("Edit Inventories", Array.from(selectedKeys))}
          onDelete={() => console.log("Delete Inventories", Array.from(selectedKeys))}
          isEditDisabled={selectedKeys.size !== 1}
          isDeleteDisabled={selectedKeys.size === 0}
        />

        {/* Filters and Rows Per Page Header */}
        <div className="flex justify-between items-center mb-4 gap-4">
          <Input
            isClearable
            className="max-w-xs"
            placeholder="Search inventories, categories..."
            startContent={<Search className="text-default-300" size={16} />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
            variant="bordered"
          />
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-default-500">Rows per page:</span>
            <Select 
              size="sm" 
              className="w-24" 
              variant="bordered"
              selectedKeys={[rowsPerPage]}
              onChange={(e) => {
                  setRowsPerPage(e.target.value);
                  setPage(1);
              }}
              aria-label="Rows per page"
            >
              <SelectItem key="25">25</SelectItem>
              <SelectItem key="50">50</SelectItem>
              <SelectItem key="100">100</SelectItem>
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
            pages > 0 ? (
              <div className="flex w-full justify-center mt-4">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={pages}
                  onChange={(page) => setPage(page)}
                />
              </div>
            ) : null
          }
        >
          <TableHeader>
            <TableColumn>INVENTORY</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>TOTAL ITEMS</TableColumn>
            <TableColumn>CREATOR</TableColumn>
            <TableColumn>VISIBILITY</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"No inventories found"}>
            {items.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer hover:bg-default-100/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FolderIcon size={18} className="text-primary" />
                    <span className="font-semibold">{inv.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="dot" color="secondary">{inv.category}</Chip>
                </TableCell>
                <TableCell className="font-mono text-default-600">{inv.items}</TableCell>
                <TableCell>
                  <User 
                    name={inv.creator} 
                    avatarProps={{ src: inv.avatar, size: "sm" }} 
                  />
                </TableCell>
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
