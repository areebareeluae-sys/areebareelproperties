import MyPropertiesPage from "@/app/components/my-propertie/MyProperties"; // Apne component ka sahi path yahan dein
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Properties | Property-pro",
};

const Page = () => {
  return (
    <div className="pt-20 bg-light dark:bg-darkmode min-h-screen">
      <MyPropertiesPage />
    </div>
  );
};

export default Page;