import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const HeroSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const imageVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const handleSearch = () => {
    if (searchQuery && location) {
      console.log(`Searching for ${searchQuery} in ${location}`);
      // Implement search logic here
    }
  };

  return (
    <motion.div
      className="relative min-h-[80vh] px-4 sm:px-8 lg:px-20 py-16 bg-gradient-to-br from-[#CE9FFC]/10 to-[#CE9FFC]/30 text-gray-900 flex items-center justify-center overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Image */}
      <motion.div className="absolute inset-0" variants={imageVariants}>
        <Image
          src="/officeBG.jpg"
          alt="Professional workspace background"
          fill
          className="object-cover opacity-15 transition-opacity duration-1000"
          priority
        />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-4xl mx-auto">
        {/* Headline */}
        <motion.h1
          className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight"
          variants={itemVariants}
        >
          Discover & Hire Top Talent <br /> for Any Role
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-base sm:text-lg text-neutral-600 max-w-2xl"
          variants={itemVariants}
        >
          Connect with skilled professionals and explore exciting career opportunities with leading companies worldwide.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 flex flex-col sm:flex-row gap-3 items-center"
          variants={itemVariants}
        >
          <div className="w-full sm:w-1/2 border flex items-center gap-2 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Job title, skills, or company"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none focus:ring-0 text-base w-full bg-transparent"
            />
          </div>
          <div className="w-full sm:w-1/2 flex border items-center gap-2 rounded-lg px-3 py-2">
            <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="border-none focus:ring-0 text-base w-full bg-transparent">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="new-york">New York</SelectItem>
                <SelectItem value="london">London</SelectItem>
                <SelectItem value="san-francisco">San Francisco</SelectItem>
                <SelectItem value="anywhere">Anywhere</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleSearch}
            className="w-full sm:w-auto bg-[#7367F0] hover:bg-[#A582F7] text-white font-semibold px-6 py-2 rounded-lg"
            disabled={!searchQuery || !location}
          >
            Find Jobs
          </Button>
        </motion.div>

        {/* Stats or CTA */}
        <motion.div className="flex gap-4 sm:gap-8 text-sm sm:text-base" variants={itemVariants}>
          <div>
            <span className="font-semibold text-[#7367F0]">500k+</span> Jobs Posted
          </div>
          <div>
            <span className="font-semibold text-[#7367F0]">1M+</span> Professionals
          </div>
          <div>
            <span className="font-semibold text-[#7367F0]">10k+</span> Companies
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;