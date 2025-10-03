"use client";

import * as React from "react";
import Image from "next/image";
import { useState } from "react";
import { Twitter, Facebook, Instagram, Github } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { usePathname } from "next/navigation";

interface FooterProps {}

const Footer = ({}: FooterProps) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    setEmail("");
  };

  const socialLinks = [
    { name: "Twitter", Icon: Twitter, url: "https://twitter.com" },
    { name: "Facebook", Icon: Facebook, url: "https://facebook.com" },
    { name: "Instagram", Icon: Instagram, url: "https://instagram.com" },
    { name: "GitHub", Icon: Github, url: "https://github.com" },
  ];

  const companyLinks = [
    { name: "About Us", url: "/aboutus" },
    { name: "Our Mission", url: "/aboutus" },
    { name: "Team", url: "/aboutus" },
    { name: "Careers", url: "/careers" },
  ];

  const helpLinks = [
    { name: "Support Center", url: "/contactus" },
    { name: "FAQs", url: "/aboutus" },
    { name: "Terms of Service", url: "/terms" },
    { name: "Privacy Policy", url: "/privacy" },
  ];

  const Tabs = [
    { name: "Home", href: "/" },
    { name: "Jobs", href: "/jobs" },
    { name: "Blogs", href: "/blogs" },
    { name: "About", href: "/aboutus" },
    { name: "Contact", href: "/contactus" },
  ];
  const pathname = usePathname();

  const specialTabs = [/^\/jobs\/[^/]+$/, /^\/profile/];

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const tabPaths = Tabs.map(tab => tab.href);
  const isTabPath = tabPaths.includes(pathname) || specialTabs.some((regex) => regex.test(pathname));

  if (!isTabPath) {
    return null;
  }

  return (
    <footer className="bg-white">
      <section className="w-full py-16 px-4 sm:px-6 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] rounded-3xl p-10 flex flex-col items-center justify-center text-center relative">
            <h2 className="text-5xl font-extrabold text-white mb-4">
              Stay Up to Date
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Subscribe to our newsletter to receive our weekly feed.
            </p>
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-2xl mx-auto flex flex-col items-center"
            >
              <div className="w-full flex items-center bg-white rounded-2xl overflow-hidden shadow-lg">
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-16 w-full border-none rounded-none text-lg px-6 bg-white focus:ring-0 focus:outline-none"
                  required
                  aria-required="true"
                />
                <Button
                  type="submit"
                  className="h-16 px-10 rounded-none rounded-r-2xl bg-[#7c3aed] text-white text-lg font-semibold hover:bg-[#8b5cf6] transition-colors duration-200"
                >
                  Subscribe
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-10 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-6">
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 lg:pr-8">
              <div className="flex items-center gap-3">
                <Image
                  alt="JobQuest Logo"
                  src="/logo.png"
                  width={40}
                  height={40}
                  className="h-10 w-auto max-w-[40px] object-contain"
                />
                <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                  JobQuest
                </h2>
              </div>
              <p className="mt-6 text-sm text-gray-600 leading-relaxed sm:text-base">
                Your one-stop platform for finding top-tier jobs and internships
                to kickstart or advance your career.
              </p>
              <ul
                className="mt-8 flex items-center gap-3"
                role="list"
                aria-label="Social media links"
              >
                {socialLinks.map(({ name, Icon, url }) => (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white transition-colors duration-200 hover:bg-jobquest-blue focus:bg-jobquest-blue"
                      aria-label={name}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 sm:text-start text-center">
              <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Company
              </h3>
              <ul className="mt-6 space-y-4" role="list">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.url}
                      className="text-sm text-gray-900 transition-colors duration-200 hover:text-jobquest-blue focus:text-jobquest-blue sm:text-base"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 sm:text-start text-center">
              <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Help
              </h3>
              <ul className="mt-6 space-y-4" role="list">
                {helpLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.url}
                      className="text-sm text-gray-900 transition-colors duration-200 hover:text-jobquest-blue focus:text-jobquest-blue sm:text-base"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <hr className="my-10 border-gray-200" />
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} JobQuest. All rights reserved.
          </p>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
