"use client";

import {
  BriefcaseBusiness,
  Building2,
  House,
  Users,
  Cog,
  LogOut,
  Bot,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import Link from "next/link";
import { motion } from "framer-motion";
import { createContext, useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "@/redux/features/AuthSlice";
import { logout as apiLogout } from "@/services/api/authService";

const SidebarContext = createContext({
  collapsed: false,
  setCollapsed: (v: boolean) => { },
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

const sidebarTabs = [
  { name: "Dashboard", path: "/employer", icon: <House className="w-5 h-5" /> },
  { name: "ManageJobs", path: "/employer/manage-jobs", icon: <BriefcaseBusiness className="w-5 h-5" /> },
  { name: "Candidates", path: "/employer/candidates", icon: <Users className="w-5 h-5" /> },
  { name: "Profile", path: "/employer/company-profile", icon: <Building2 className="w-5 h-5" /> },
  { name: "AI Interviews", path: "/employer/ai-interviews", icon: <Bot className="w-5 h-5" /> },
  { name: "Settings", path: "/employer/settings", icon: <Cog className="w-5 h-5" /> },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Call the logout API
      const success = await apiLogout();
      
      // Dispatch the logout action to clear Redux state
      dispatch(logoutAction());
      
      // Redirect to login page
      if (success) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
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
              <div className="relative flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-base transition-colors overflow-hidden">
                {selected && (
                  <motion.div
                    layoutId="sidebar-selected"
                    className="absolute inset-0 rounded-xl bg-[#eceeff] z-0"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-4 ${selected ? "text-[#7367F0] font-semibold" : "text-gray-600"}`}>
                  {item.icon}
                  {item.name.replace(/([A-Z])/g, " $1").trim()}
                </span>
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
      <div className="lg:block hidden border-r border-gray-200 xl:w-[300px] w-[227px] h-[100svh] bg-white">
        {sidebarContent}
      </div>
      {/* Mobile */}
      <div className="lg:hidden block m-2">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg border bg-white shadow">
              {React.cloneElement(selectedTab.icon, {
                className: `w-5 h-5`,
              })}
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[70vw] min-w-[200px] max-w-[400px]">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Sidebar;
