"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { Tooltip } from "@heroui/tooltip";
import { motion } from "framer-motion";
import { FolderIcon, StarIcon, TagIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const latestInventories = [
  { id: 1, name: "Office Hardware 2026", desc: "Laptops, monitors, and peripherals", creator: "Alice Smith", avatar: "https://i.pravatar.cc/150?u=1", date: "2 mins ago" },
  { id: 2, name: "HR Documents", desc: "Employee handbooks and policies", creator: "Bob Jones", avatar: "https://i.pravatar.cc/150?u=2", date: "1 hour ago" },
  { id: 3, name: "Central Library", desc: "History and Science books catalog", creator: "Carol White", avatar: "https://i.pravatar.cc/150?u=3", date: "5 hours ago" },
];

const popularInventories = [
  { id: 1, name: "Main Warehouse", category: "Equipment", items: 1240, creator: "Dave Brown", avatar: "https://i.pravatar.cc/150?u=4" },
  { id: 2, name: "Company Vehicles", category: "Transport", items: 45, creator: "Eve Black", avatar: "https://i.pravatar.cc/150?u=5" },
  { id: 3, name: "Software Licenses", category: "IT", items: 890, creator: "Alice Smith", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 4, name: "Office Furniture", category: "Furniture", items: 350, creator: "Carol White", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: 5, name: "Marketing Assets", category: "Digital", items: 5000, creator: "Frank Green", avatar: "https://i.pravatar.cc/150?u=6" },
];

const tags = [
  { name: "Electronics", count: 12 },
  { name: "Books", count: 8 },
  { name: "Vehicles", count: 3 },
  { name: "HR", count: 5 },
  { name: "IT", count: 20 },
  { name: "Furniture", count: 7 },
  { name: "Digital", count: 15 },
  { name: "Hardware", count: 11 },
  { name: "Software", count: 9 },
  { name: "Marketing", count: 4 },
];

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();

  const handleRowAction = (key: React.Key) => {
    router.push(`/inventory/${key}`);
  };

  return (
    <div className="flex flex-col px-4 gap-10 py-8">
      {/* Latest Inventories */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FolderIcon className="text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t("home.latest")}
          </h2>
        </div>
        <Table aria-label="Latest Inventories Table" className="shadow-lg" selectionMode="multiple" onRowAction={handleRowAction}>
          <TableHeader>
            <TableColumn>INVENTORY</TableColumn>
            <TableColumn>DESCRIPTION</TableColumn>
            <TableColumn>CREATOR</TableColumn>
            <TableColumn>DATE</TableColumn>
          </TableHeader>
          <TableBody>
            {latestInventories.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer hover:bg-default-100/50 transition-colors">
                <TableCell className="font-semibold">{inv.name}</TableCell>
                <TableCell className="text-default-500">{inv.desc}</TableCell>
                <TableCell>
                  <User 
                    name={inv.creator} 
                    avatarProps={{ src: inv.avatar, size: "sm" }} 
                  />
                </TableCell>
                <TableCell className="text-default-400">{inv.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Popular Inventories */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <StarIcon className="text-warning" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-warning to-danger bg-clip-text text-transparent">
              {t("home.popular")}
            </h2>
          </div>
          <Table aria-label="Popular Inventories Table" className="shadow-lg" selectionMode="multiple" onRowAction={handleRowAction}>
            <TableHeader>
              <TableColumn>INVENTORY</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>ITEMS</TableColumn>
              <TableColumn>CREATOR</TableColumn>
            </TableHeader>
            <TableBody>
              {popularInventories.map((inv) => (
                <TableRow key={inv.id} className="cursor-pointer hover:bg-default-100/50 transition-colors">
                  <TableCell className="font-semibold">{inv.name}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="dot" color="primary">{inv.category}</Chip>
                  </TableCell>
                  <TableCell className="font-mono">{inv.items.toLocaleString()}</TableCell>
                  <TableCell>
                    <User 
                      name={inv.creator} 
                      avatarProps={{ src: inv.avatar, size: "sm" }} 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.section>

        {/* Tag Cloud */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-default-50/50 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-6">
            <TagIcon className="text-secondary" />
            <h2 className="text-2xl font-bold text-default-800">
              {t("home.tags")}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Tooltip key={tag.name} content={`${tag.count} inventories`}>
                <Chip
                  className="cursor-pointer hover:scale-105 transition-transform"
                  variant="flat"
                  color={tag.count > 10 ? "secondary" : "default"}
                  size={tag.count > 10 ? "lg" : tag.count > 5 ? "md" : "sm"}
                >
                  {tag.name}
                </Chip>
              </Tooltip>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
