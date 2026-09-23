import MyInventory from "@/app/components/my-inventory/myinventry"; // Component ka naam Capital rakhein
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Properties | Property-pro",
};

const Page = () => {
  return (
    <div className="pt-20 bg-light dark:bg-darkmode min-h-screen">
      <MyInventory /> {/* Tag name bhi Capital hona chahiye */}
    </div>
  );
};

export default Page;