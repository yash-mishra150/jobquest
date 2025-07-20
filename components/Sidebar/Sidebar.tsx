"use client";

import {
  BriefcaseBusiness,
  Building2,
  House,
  MessagesSquare,
  Users,
  FileText,
  Bookmark,
  Package,
  Bell,
  Lock,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { usePathname } from "next/navigation";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import Link from "next/link";

const sidebarTabs = [
  { name: "Dashboard", path: "/employer", icon: <House className="w-5 h-5" /> },
  { name: "ManageJobs", path: "/employer/manage-jobs", icon: <BriefcaseBusiness className="w-5 h-5" /> },
  { name: "Messages", path: "/employer/messages", icon: <MessagesSquare className="w-5 h-5" /> },
  { name: "Candidates", path: "/employer/candidates", icon: <Users className="w-5 h-5" /> },
  { name: "CompanyProfile", path: "/employer/company-profile", icon: <Building2 className="w-5 h-5" /> },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      setLoggingOut(false);
      // Add your logout logic here
    }, 1500);
  };

  const selectedTab = sidebarTabs.find(tab => pathname === tab.path) || sidebarTabs[0];

  const sidebarContent = (
    <div className="flex flex-col gap-6 pt-8 px-6 h-full">
      <Image
        alt="JobQuest Logo"
        src={"/logoDark.png"}
        width={180}
        height={60}
        className="h-12 w-auto object-contain mb-10 mx-auto"
      />
      <div className="flex flex-col gap-4 flex-1">
        {sidebarTabs.map((item, index) => {
          const selected = pathname === item.path;
          return (
            <Link href={item.path} key={index} className="no-underline">
              <div
                className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-base transition-colors
                  ${selected ? "bg-[#eceeff] text-[#7367F0] font-semibold" : "hover:bg-gray-100 text-gray-600"}`}
              >
                {React.cloneElement(item.icon, {
                  className: `w-5 h-5 ${selected ? "text-[#7367F0]" : "text-gray-500"}`,
                })}
                <span>{item.name.replace(/([A-Z])/g, " $1").trim()}</span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto pb-8">
        <button
          className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-base font-semibold transition-colors text-[#e53e3e] hover:bg-[#fbeaea] justify-start`}
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <span className="animate-spin">
              <LogOut className="w-5 h-5 text-[#e53e3e]" />
            </span>
          ) : (
            <LogOut className="w-5 h-5 text-[#e53e3e]" />
          )}
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="lg:block hidden border-r border-gray-200 w-[260px] xl:w-[300px] h-screen bg-white">
        {sidebarContent}
      </div>
      {/* Mobile */}
      <div className="lg:hidden block">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 m-2 rounded-lg border bg-white shadow">
              {React.cloneElement(selectedTab.icon, {
                className: `w-5 h-5`,
              })}
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[260px] xl:w-[300px]">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Sidebar;
