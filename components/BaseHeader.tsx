"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion"; // Fixed import
import { usePathname } from "next/navigation";

const BaseHeader = () => {
    const pathname = usePathname();

    const routeContent = [
        {
            pathname: "/blogs",
            heading: "Explore Our Blogs",
            subheading: "Discover insights, tips, and trends from industry experts.",
        },
        {
            pathname: "/aboutus",
            heading: "About Me",
            subheading: "Learn about our mission, vision, and team driving innovation.",
        },
        {
            pathname: "/contactus",
            heading: "Get in Touch",
            subheading: "Reach out to us for inquiries or collaboration opportunities.",
        },
        {
            pathname: "/jobs",
            heading: "Find Your Dream Job",
            subheading: "Browse top job postings and start your career journey today.",
        },
    ];

    // Find the matching route content
    const currentRoute = routeContent.find((item) => item.pathname === pathname);

    // Return null if pathname doesn't match any allowed routes
    if (!currentRoute) {
        return null;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 },
        },
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    const imageVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    return (
        <motion.div
            key={pathname} // Force remount on route change to replay animations
            className="relative min-h-[60vh] px-4 sm:px-8 lg:px-20 py-16 bg-gradient-to-br from-[#1a0034] to-[#231c2b] text-gray-900 flex items-center justify-center overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="absolute inset-0" variants={imageVariants}>
                <Image
                    src="/officeBG.jpg"
                    alt="Professional workspace background"
                    fill
                    className="object-cover opacity-15 transition-opacity duration-1000"
                    priority
                    quality={75}
                    onError={() => console.error("Failed to load background image")}
                />
            </motion.div>

            <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-4xl mx-auto">
                <motion.h1
                    className="text-3xl sm:text-5xl lg:text-6xl text-white font-bold leading-tight"
                    variants={itemVariants}
                >
                    {currentRoute.heading}
                </motion.h1>

                <motion.p
                    className="text-base sm:text-lg text-neutral-400 max-w-2xl"
                    variants={itemVariants}
                >
                    {currentRoute.subheading}
                </motion.p>
            </div>
        </motion.div>
    );
};

export default BaseHeader;
