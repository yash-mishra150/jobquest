"use client";
import * as React from 'react';
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const jobs = [
  {
    logo: "/images/profile/user-1.png",
    company: "Yata",
    location: "Pereira",
    title: "Nuclear Power Engineer",
    tags: ["React"],
    salary: "₹53k / Yearly",
    posted: "7 days ago",
  },
  {
    logo: "/logos/blognation.png",
    company: "Blognation",
    location: "Solna",
    title: "Technical Writer",
    tags: ["Trending"],
    salary: "₹19k / Yearly",
    posted: "12 days ago",
  },
  {
    logo: "/logos/mynte.png",
    company: "Mynte",
    location: "Minchinābād",
    title: "Professor",
    tags: ["Trending"],
    salary: "₹27k / Yearly",
    posted: "10 days ago",
  },
  {
    logo: "/logos/voonder.png",
    company: "Voonder",
    location: "Obrenovac",
    title: "Financial Advisor",
    tags: ["Wordpress"],
    salary: "₹21k / Yearly",
    posted: "21 days ago",
  },
  {
    logo: "/logos/abata.png",
    company: "Abata",
    location: "Thị Trấn Nho Quan",
    title: "Associate Professor",
    tags: ["Marketing"],
    salary: "₹34k / Yearly",
    posted: "12 days ago",
  },
  {
    logo: "/logos/linktype.png",
    company: "Linktype",
    location: "Velká nad Veličkou",
    title: "GIS Technical Architect",
    tags: ["Marketing"],
    salary: "₹19k / Yearly",
    posted: "9 days ago",
  },
  {
    logo: "/logos/devify.png",
    company: "Devify",
    location: "Palhoça",
    title: "Electrical Engineer",
    tags: ["Trending"],
    salary: "₹31k / Yearly",
    posted: "2 days ago",
  },
  {
    logo: "/logos/eimbee.png",
    company: "Eimbee",
    location: "Neikeng",
    title: "Assistant Media Planner",
    tags: ["Design"],
    salary: "₹37k / Yearly",
    posted: "10 days ago",
  },
  {
    logo: "/logos/jazzy.png",
    company: "Jazzy",
    location: "Glendale",
    title: "Environmental Specialist",
    tags: ["App"],
    salary: "₹19k / Yearly",
    posted: "19 days ago",
  },
  {
    logo: "/logos/jamia.png",
    company: "Jamia",
    location: "Oka",
    title: "Associate Professor",
    tags: ["React"],
    salary: "₹25k / Yearly",
    posted: "2 days ago",
  },
];

const tags = ["App", "Administrative", "Android", "Wordpress", "Design", "React", "Marketing", "Trending"];

const page = () => {
  const router = useRouter();

  return (
    <div className="bg-[#fafaff] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar Filters */}
          <motion.aside
            initial={{ x: 0, y: 60, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-6 w-full lg:max-w-xs flex-shrink-0 mb-8 lg:mb-0 lg:motion-safe:initial-x-[-60] lg:motion-safe:initial-y-0"
          >
            <div className="bg-[#f6f5fd] rounded-[24px] p-6 w-full lg:max-w-[400px]">
              <Label className="block text-xl font-bold mb-4">Search by Keywords</Label>
              <Input
                type="text"
                placeholder="Job title, keywords, or company"
                className="w-full h-[6.5vh] mb-6 px-6 py-0 rounded-[12px] bg-white text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa] border-none"
              />
              <Label className="block text-xl font-bold mb-4">Location</Label>
              <Input
                type="text"
                placeholder="City or postcode"
                className="w-full h-[6.5vh] px-6 py-0 rounded-[12px] bg-white text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa] border-none"
              />
            </div>
            <div className="bg-[#f6f5fd] rounded-2xl p-6 shadow">
              <Label className="block text-lg font-semibold mb-2">Date Posted</Label>
              <RadioGroup defaultValue="all" className="flex flex-col gap-2 text-gray-600 text-sm">
                <Label className="flex items-center gap-2"><RadioGroupItem value="all" />All</Label>
                <label className="flex items-center gap-2"><RadioGroupItem value="hour" />Last Hour</label>
                <label className="flex items-center gap-2"><RadioGroupItem value="24h" />Last 24 Hour</label>
                <label className="flex items-center gap-2"><RadioGroupItem value="7d" />Last 7 Days</label>
                <label className="flex items-center gap-2"><RadioGroupItem value="14d" />Last 14 Days</label>
                <label className="flex items-center gap-2"><RadioGroupItem value="30d" />Last 30 Days</label>
              </RadioGroup>
            </div>
            <div className="bg-[#f6f5fd] rounded-2xl p-6 shadow">
              <Label className="block text-lg font-semibold mb-2">Experience Level</Label>
              <div className="flex flex-col gap-2 text-gray-600 text-sm">
                <label className="flex items-center gap-2"><Checkbox />Fresh</label>
                <label className="flex items-center gap-2"><Checkbox />1 Year</label>
                <label className="flex items-center gap-2"><Checkbox />2 Year</label>
                <label className="flex items-center gap-2"><Checkbox />3 Year</label>
                <label className="flex items-center gap-2"><Checkbox />4 Year</label>
              </div>
            </div>
            <div className="bg-[#f6f5fd] rounded-2xl p-6 shadow">
              <Label className="block text-lg font-semibold mb-2">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#ece9fe] text-[#7367F0] px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 hover:bg-[#7367F0] hover:text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="text-lg font-semibold text-gray-700">Show <span className="font-bold">{jobs.length}</span> jobs</div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" className="rounded-xl w-full sm:w-auto">Sort by</Button>
                <Button variant="outline" className="rounded-xl w-full sm:w-auto">All</Button>
              </div>
            </div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {jobs.map((job, idx) => (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { y: 40, opacity: 0 },
                    visible: { y: 0, opacity: 1 }
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={idx % 2 === 0 ? "even:bg-[#f6f5fd]" : ""}
                >
                  <JobCard
                    {...job}
                    onApply={() => router.push(`/jobs/${encodeURIComponent(job.title.replace(/\s+/g, "-"))}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default page;