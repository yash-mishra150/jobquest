"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Menu, Lock, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/slices/AuthSlice';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const Tabs = [
  { name: 'Home', href: '/' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'Internships', href: '/internships' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="p-4 px-4 md:px-10 relative shadow-sm w-full z-30">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo Section */}
        <div className="flex gap-2 items-center">
          <Image
            alt="JobQuest Logo"
            src="/logoDark.png"
            width={400}
            height={400}
            className="h-10 w-auto max-w-[400px] object-contain"
          />
        </div>

        {/* Desktop Menu */}
        <motion.div
          className="hidden md:flex gap-4 items-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { y: -20, opacity: 0 },
            visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
          }}
        >
          <div className="flex gap-2">
            {Tabs.map((item, index) => (
              <Button
                variant="link"
                key={index}
                className="p-2 text-base hover:text-[#7367F0]"
                asChild
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}
          </div>
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl || ''} alt="User avatar" />
                    <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name || 'User'}</DropdownMenuLabel>
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
              <Button variant="link" asChild>
                <Link href="/login">
                  <Lock className="mr-1 h-4 w-4" /> Log In
                </Link>
              </Button>
              <Button
                className="bg-[#7367F0] text-white poppins hover:bg-[#3b8791]"
                asChild
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu with Animation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden mt-4 flex flex-col gap-2 bg-white absolute top-full left-0 w-full p-4 rounded-md shadow-sm z-10"
          >
            {Tabs.map((item, index) => (
              <Button
                variant="link"
                key={index}
                className="p-2 text-base justify-start hover:text-[#7367F0]"
                asChild
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <Button
                  variant="link"
                  className="p-2 text-base justify-start hover:text-[#7367F0]"
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button
                  variant="link"
                  className="p-2 text-base justify-start hover:text-[#7367F0]"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="link"
                  className="p-2 text-base justify-start"
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href="/login">
                    <Lock className="mr-2 h-4 w-4" /> Log In
                  </Link>
                </Button>
                <Button
                  className="bg-[#7367F0] text-white poppins hover:bg-[#A582F7] justify-start"
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;