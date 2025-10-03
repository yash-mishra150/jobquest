"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Lock, LogOut, User, Facebook, Twitter, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/features/AuthSlice";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const Tabs = [
  { name: "Home", href: "/" },
  { name: "Jobs", href: "/jobs" },
  { name: "Blogs", href: "/blogs" },
  { name: "About", href: "/aboutus" },
  { name: "Contact", href: "/contactus" },
];

const specialTabs = [/^\/jobs\/[^/]+$/, /^\/profile$/];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useDispatch();
  const { isLoggedIn, user, userName } = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const isSpecialTab = specialTabs.some((regex) => regex.test(pathname));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const tabPaths = Tabs.map(tab => tab.href);
  const isTabPath = tabPaths.includes(pathname) || specialTabs.some((regex) => regex.test(pathname));

  if (!isTabPath) {
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-white' : 'bg-transparent'}`}
      style={{ backdropFilter: "none" }}
    >
      <div className="p-4 px-4 md:px-10 relative w-full">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo Section */}
          <motion.div
            className="flex gap-2 items-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { y: -20, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            <Image
              alt="JobQuest Logo"
              src={(scrolled || isSpecialTab) ? "/logoDark.png" : "/logoLight.png"}
              width={400}
              height={400}
              className="h-10 w-auto max-w-[400px] object-contain"
            />
          </motion.div>

          {/* Centered Links */}
          <motion.div
            className={`hidden md:flex gap-6 items-center flex-1 justify-center`}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { y: -20, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            {Tabs.map((item, index) => (
              <Button
                variant="link"
                key={index}
                className={`p-2 text-base font-medium hover:text-[#7367F0] ${(isSpecialTab || scrolled) ? "" : "text-white"}`}
                asChild
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}
          </motion.div>

          {/* Login/Profile Section on Right */}
          <motion.div
            className="hidden md:flex gap-4 items-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { y: -20, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.avatarUrl || ""}
                        alt="User avatar"
                      />
                      <AvatarFallback>{userName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{userName || "User"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-3 flex items-center">
                <Button
                  className="bg-[#7367F0] text-white poppins hover:bg-[#3b8791]"
                  asChild
                >
                  <Link href="/login"><Lock className="mr-1 h-4 w-4" /> Log In</Link>
                </Button>
              </div>
            )}
          </motion.div>

          {/* Mobile Menu Button & Sheet */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant={null} size="icon">
                  <Menu  className={`${scrolled ? "text-gray-900" : "text-white"} hover:text-black`} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-6 flex flex-col gap-4 w-3/4 max-w-xs">
                <div className="flex flex-col gap-2 mt-6">
                  {Tabs.map((item, index) => (
                    <Button
                      variant="link"
                      key={index}
                      className="p-2 text-base justify-start hover:text-[#7367F0] text-gray-900"
                      asChild
                    >
                      <Link href={item.href}>{item.name}</Link>
                    </Button>
                  ))}
                </div>
                {/* Divider */}
                <div className="my-4 border-t border-gray-200" />
                {/* Auth/Profile Buttons */}
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2">
                    <Button asChild className="bg-[#a78bfa] text-white font-semibold hover:bg-[#bfa7fa] w-full">
                      <Link href="/profile">Profile</Link>
                    </Button>
                    <Button asChild className="bg-[#ede9fe] text-[#a78bfa] font-semibold hover:bg-[#f5f3ff] w-full">
                      <Link href="/applications">My Applications</Link>
                    </Button>
                    <Button asChild className="bg-[#ede9fe] text-[#a78bfa] font-semibold hover:bg-[#f5f3ff] w-full">
                      <Link href="/saved-jobs">Saved Jobs</Link>
                    </Button>
                    <Button className="border-[#a78bfa] text-[#a78bfa] font-semibold hover:bg-[#f5f3ff] w-full" variant="outline" onClick={handleLogout}>
                      Log Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild className="bg-[#a78bfa] text-white font-semibold hover:bg-[#bfa7fa] w-full">
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-[#a78bfa] text-[#a78bfa] font-semibold hover:bg-[#f5f3ff] w-full">
                      <Link href="/login">Log In</Link>
                    </Button>
                  </div>
                )}
                {/* Get in Touch */}
                <div className="mt-6">
                  <p className="text-gray-500 text-sm mb-1">Get in Touch <a href="mailto:yashm4720@gmail.com" className="text-[#a78bfa] underline ml-1">yashm4720@gmail.com</a></p>
                  <div className="flex gap-4 mt-2">
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#3b5998] hover:text-[#1d3557]">
                      <Facebook size={22} />
                    </a>
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#1da1f2] hover:text-[#0d8ddb]">
                      <Twitter size={22} />
                    </a>
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#405de6] hover:text-[#833ab4]">
                      <Instagram size={22} />
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
