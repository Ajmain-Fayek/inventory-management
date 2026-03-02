import { InventoryProvider } from "@/context/InventoryContext";

const InventoryLayout = ({ children }: { children: React.ReactNode }) => {
  return <InventoryProvider>{children}</InventoryProvider>;
};

export default InventoryLayout;
