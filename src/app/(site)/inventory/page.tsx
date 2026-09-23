import Inventory from "@/app/components/inventory-list/search";
import { InventoryContextProvider } from "@/context-api/inventoryContext"; // Naam update kar diya gaya hai
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My inventory | inventory-pro",
};

const Page = () => {
  return (
    <div className="pt-20 bg-light dark:bg-darkmode min-h-screen">
      <InventoryContextProvider>
        <Inventory />
      </InventoryContextProvider>
    </div>
  );
};

export default Page;