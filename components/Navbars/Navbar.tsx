"use client";

import * as React from 'react';
import { useState } from 'react';
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

  if (pathname == "/login" || pathname == "/signup") {
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
    <nav className="p-4 px-4 md:px-10 relative shadow-sm w-full">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo Section */}
        <div className="flex gap-2 items-center">
          <Image
            alt="JobQuest Logo"
            src="/logo.png"
            width={40}
            height={40}
            className="h-10 w-auto max-w-[40px] object-contain"
          />
          <h1 className="font-semibold text-xl md:text-2xl">JobQuest</h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 items-center">
          <div className="flex gap-2">
            {Tabs.map((item, index) => (
              <Button
                variant="link"
                key={index}
                className="p-2 text-base hover:text-[#49a6b4]"
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
                className="bg-[#49a6b4] text-white poppins hover:bg-[#3b8791]"
                asChild
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-2 bg-transparent relative p-4 rounded-md shadow-sm">
          {Tabs.map((item, index) => (
            <Button
              variant="link"
              key={index}
              className="p-2 text-base justify-start hover:text-[#49a6b4]"
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
                className="p-2 text-base justify-start hover:text-[#49a6b4]"
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
                className="p-2 text-base justify-start hover:text-[#49a6b4]"
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
                className="bg-[#49a6b4] text-white poppins hover:bg-[#3b8791] justify-start"
                asChild
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;