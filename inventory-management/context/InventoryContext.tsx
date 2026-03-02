"use client";

import { IInventory } from "@/app/inventory/_interface";
import { createContext, ReactNode, useContext, useState } from "react";

interface IInventoryContextType {
  allInventories: IInventory[];
  setAllInventoris: (inv: IInventory[]) => void;
  invPage: number;
  setInvPage: (i: number) => void;
  invTotalPages: number;
  setInvTotalPages: (i: number) => void;
  invRecordLimit: number;
  setInvRecordLimit: (i: number) => void;
  totalInventories: number;
  setTotalInventories: (i: number) => void;
  inventory: IInventory | null;
  setInventory: (inv: IInventory) => void;
  inventoryColumns: string[];
  setInventoryColumns: (inventoryColumns: string[]) => void;
  items: string[];
  setItems: (itm: string[]) => void;
  itemPage: number;
  itemTotalPages: number;
  setItemTotalPages: (i: number) => void;
  setItemPage: (i: number) => void;
  itemRecordLimit: number;
  setItemRecordLimit: (i: number) => void;
  totalItems: number;
  setTotalItems: (i: number) => void;
}

const InventoryContext = createContext<IInventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  // All inventory
  const [allInventories, setAllInventoris] = useState<IInventory[]>([]);
  const [invPage, setInvPage] = useState<number>(1);
  const [invTotalPages, setInvTotalPages] = useState<number>(1);
  const [invRecordLimit, setInvRecordLimit] = useState<number>(25);
  const [totalInventories, setTotalInventories] = useState<number>(0);

  // [id] Inventory
  const [inventory, setInventory] = useState<IInventory | null>(null);
  const [inventoryColumns, setInventoryColumns] = useState<string[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const [itemPage, setItemPage] = useState<number>(1);
  const [itemTotalPages, setItemTotalPages] = useState<number>(1);
  const [itemRecordLimit, setItemRecordLimit] = useState<number>(25);
  const [totalItems, setTotalItems] = useState<number>(0);

  return (
    <InventoryContext.Provider
      value={{
        allInventories,
        setAllInventoris,
        invPage,
        setInvPage,
        invTotalPages,
        setInvTotalPages,
        invRecordLimit,
        setInvRecordLimit,
        totalInventories,
        setTotalInventories,
        inventory,
        setInventory,
        setInventoryColumns,
        inventoryColumns,
        items,
        setItems,
        itemPage,
        setItemPage,
        itemTotalPages,
        setItemTotalPages,
        itemRecordLimit,
        setItemRecordLimit,
        totalItems,
        setTotalItems,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within a InventoryProvider");
  }

  return context;
};
