"use client";

import * as React from "react";
import { motion } from "framer-motion";
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DynamicForm } from "@/components/DynamicFormAdd";
import type { FormFieldConfig } from "@/components/DynamicFormAdd";

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
    tags: [
      "Wordpress",
      "Wordpress",
      "Wordpress",
      "Wordpress",
      "Wordpress",
      "Wordpress",
      "Wordpress",
    ],
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

const jobFormConfig: FormFieldConfig[] = [
  { name: "title", label: "Job Title", type: "text", required: true },
  { name: "workMode", label: "Work Mode", type: "select", required: true, options: [
    { value: "hybrid", label: "Hybrid" },
    { value: "remote", label: "Remote" },
    { value: "offline", label: "Offline" },
  ] },
  { name: "skills", label: "Skills", type: "tags", required: true, fullWidth: true },
  { name: "experience", label: "Experience Needed (years)", type: "text", required: true, regex: "^\\d+$" },
  {
    name: "salary",
    label: "Salary",
    type: "text",
    required: false,
    regex: "^\\d+k$",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: true,
    minLength: 10,
    fullWidth: true,
  },
];

const Page = () => {
  const formRef = React.useRef<HTMLFormElement>(null) as React.RefObject<HTMLFormElement>;

  const handleFormSubmit = (values: { [key: string]: unknown | undefined }) => {
    console.log("Form submitted with values:", values);
    // Clear the form after submit
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <div className="w-full p-10 pt-6 bg-gray-100">
      <h1 className="text-3xl font-semibold">Manage Jobs</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-gray-500">Show</span>
          <Select defaultValue="10">
            <SelectTrigger className="w-20 border border-[#7367F0] focus:ring-2 focus:ring-[#7367F0] focus:border-[#7367F0]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-gray-500">entries</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7367F0]">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke="black" strokeWidth="2" />
                <path
                  stroke="#7367F0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M21 21l-3.5-3.5"
                />
              </svg>
            </span>
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 w-full border-1 border-neutral-400 focus:ring-2 focus:ring-[#7367F0] focus:border-[#7367F0]"
            />
          </div>
          <div className="">
            <DynamicForm
              formRef={formRef}
              buttonTitle="Create a Job"
              config={jobFormConfig}
              onSubmit={handleFormSubmit}
              title="Create Job"
              description="Fill in the details to create a new job."
              submitButtonText="Create"
              drawerHeight="h-[100vh]"
            />
          </div>
        </div>
      </div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
        className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {jobs.map((job, idx) => (
          <motion.div
            key={`${job.title}-${job.company}-${idx}`}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { y: 40, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={idx % 2 === 0 ? "bg-[#f6f5fd]" : ""}
          >
            <JobCard {...job} editMode={true} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Page;
