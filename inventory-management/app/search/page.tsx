"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { useSearchParams, useRouter } from "next/navigation";
// import { useLanguage } from "@/context/LanguageContext";
import { Search, FolderIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { Suspense } from "react";

const searchResults = [
  {
    id: 1,
    name: "Office Hardware 2026",
    desc: "Laptops, monitors, and peripherals",
    category: "Hardware",
    creator: "Alice Smith",
    avatar: "https://i.pravatar.cc/150?u=1",
    match: "Matches 'hardware' in title, tags",
  },
  {
    id: 4,
    name: "Server Rack Equipment",
    desc: "Networking and server hardware",
    category: "Hardware",
    creator: "Bob Jones",
    avatar: "https://i.pravatar.cc/150?u=2",
    match: "Matches 'hardware' in tags",
  },
];

export default function SearchResultsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsPage />
    </Suspense>
  );
}

function SearchResultsPage() {
  // const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams?.get("q") || "hardware"; // Defaulting just for UI demo purposes

  const handleRowAction = (key: React.Key) => {
    router.push(`/inventory/${key}`);
  };

  return (
    <div className="flex flex-col gap-10 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
          <Search size={32} />
        </div>
        <h1 className="text-3xl font-bold">
          Search Results for <span className="text-primary">&quot;{query}&quot;</span>
        </h1>
        <p className="text-default-500">
          Found {searchResults.length} inventories matching your current query.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <Table
          aria-label="Search Results Table"
          className="shadow-lg"
          selectionMode="multiple"
          onRowAction={handleRowAction}
        >
          <TableHeader>
            <TableColumn>INVENTORY</TableColumn>
            <TableColumn>DESCRIPTION</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>MATCH CONTEXT</TableColumn>
            <TableColumn>CREATOR</TableColumn>
          </TableHeader>
          <TableBody>
            {searchResults.map((inv) => (
              <TableRow
                key={inv.id}
                className="cursor-pointer hover:bg-default-100/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FolderIcon size={18} className="text-primary" />
                    <span className="font-semibold">{inv.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-default-500">{inv.desc}</TableCell>
                <TableCell>
                  <Chip size="sm" variant="dot" color="secondary">
                    {inv.category}
                  </Chip>
                </TableCell>
                <TableCell className="text-xs text-default-400 italic">{inv.match}</TableCell>
                <TableCell>
                  <User name={inv.creator} avatarProps={{ src: inv.avatar, size: "sm" }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.section>
    </div>
  );
}
