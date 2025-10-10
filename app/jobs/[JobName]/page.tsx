"use client";

import * as React from 'react';
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Heart, Share2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const jobData = {
  title: "React/ Node Js Live Project Expert",
  link: "https://internshala.com/internship/detail/work-from-home-react-node-js-live-project-expert-internship-at-kaushal-ranjeet-private-limited1746873630",
  companyName: "Kaushal Ranjeet Private Limited",
  location: "Work from home",
  duration: "3 Months",
  stipend: "₹ 7,000 - 12,000 /month",
  earlyApplicant: false,
  skills: [
    "Node.js",
    "React",
    "React Native",
    "Web Application Security",
    "Web Application Testing"
  ],
  jobDescription:
    "Selected intern's day-to-day responsibilities:\n\n1. Develop and implement front-end and back-end solutions using React Native, Node.js, and React\n2. Collaborate with the team to ensure the security of web applications and conduct regular testing\n3. Troubleshoot and debug issues to optimize the performance of web applications\n4. Assist in the design and development of new features for live projects\n5. Participate in project meetings and contribute innovative ideas to improve project outcomes",
  aboutCompany:
    "Lelekart, under the adept guidance of Kaushal Ranjeet Private Limited, is an Indian e-commerce pioneer committed to transforming fashion retail. We blend style, quality, and affordability, offering an array of clothing that speaks to your individuality.",
  numberOfOpenings: "1",
  timestamp: "2025-05-10T18:15:22.441Z",
  logo: ""
};

const page = () => {
  const params = useParams();
  const jobName = params.JobName;

  // read selected job details from sessionStorage if present
  const [remoteJob, setRemoteJob] = React.useState<any | null>(null);

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('selectedJob');
      if (raw) {
        const parsed = JSON.parse(raw);
        setRemoteJob(parsed);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const imageVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const logoSrc = "/logos/blognation.png";

  const show = remoteJob || jobData;

  return (
    <div className="bg-white min-h-screen pt-24">
      {/* Header Image */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex justify-center mt-5">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-full h-[32vh] md:h-[40vh]"
        >
          <Image
            src="/officeBG.jpg"
            alt="Professional workspace background"
            fill
            className="object-cover rounded-3xl"
            priority
          />
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute left-4 md:left-8 bottom-[-2.5rem]"
          >
            <div className="w-20 h-20 rounded-2xl bg-white shadow flex items-center justify-center">
              {show.logo ? (
                <Image src={show.logo} alt={show.companyName || show.company} width={64} height={64} className="w-full h-full object-contain rounded-2xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-2xl bg-[#ece9fe]">
                  <span className="text-[#7367F0] text-2xl font-bold">{(show.companyName || show.company || 'U').charAt(0)}</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-20 -mt-8 relative z-10">
        {/* Top row: job info and actions */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 w-full">
            <div className="flex-1">
              <Label className="text-[#7367F0] font-semibold text-base mb-1">{show.companyName || show.company || ''}</Label>
              <h1 className="text-xl md:text-2xl font-semibold tracking-wide text-gray-900 leading-normal mb-1">{show.title || 'Job Details'}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-base">
                <MapPin size={18} />
                {show.location}
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
                <CalendarDays size={16} />
                {new Date(show.timestamp || show.postedDate || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
            <div className="flex gap-3 items-center mt-4 md:mt-0">
              <Button variant="ghost" size="icon" className="rounded-full border border-gray-200">
                <Heart size={22} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full border border-gray-200">
                <Share2 size={22} />
              </Button>
              <Button asChild className="bg-[#7367F0] text-white font-semibold px-6 py-2 rounded-xl hover:bg-[#5b4acb]">
                <a href={jobData.link} target="_blank" rel="noopener noreferrer">Apply Now</a>
              </Button>
            </div>
          </div>
          {/* Main content and sidebar on same line */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 w-full">
            <div className="flex-1">
              <div className="">
                <Label className="font-bold text-lg mb-2">Overview</Label>
                <p className="text-gray-700 leading-relaxed mt-2">{show.aboutCompany || show.companyDescription || ''}</p>
              </div>
              <div className="mt-8">
                <Label className="font-bold text-lg mb-2">Responsibilities</Label>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
                  {(show.jobDescription || show.description || '').toString().split("\n").map((line: string, idx: number) => (
                    line.trim() && <li key={idx}>{line.replace(/^[0-9]+\. /, "")}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Label className="font-bold text-lg mb-2">Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(show.skills || show.skillsList || []).map((skill: string) => (
                    <Badge key={skill} className="bg-[#ece9fe] text-[#7367F0] px-3 py-1 rounded-full text-xs font-medium">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <Label className="font-bold text-lg mb-2">Experience</Label>
                <div className="text-gray-700 text-base font-semibold mt-2">{show.experience || show.experienceRange || show.experience_required || ''}</div>
              </div>
            </div>
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full md:max-w-xs flex-shrink-0 bg-[#f6f5fd] rounded-2xl p-6 shadow mt-16 md:mt-0"
            >
              <div className="mb-6">
                <Label className="font-bold text-lg mb-2">Job Details</Label>
                <div className="flex flex-col gap-2 text-gray-700 text-base">
                  <div><span className="font-semibold">Duration:</span> {show.duration || ''}</div>
                  <div><span className="font-semibold">Stipend:</span> {show.stipend || show.salary || ''}</div>
                  <div><span className="font-semibold">Employment Type:</span> {show.jobType || ''}</div>
                  <div><span className="font-semibold">Posted:</span> {new Date(show.timestamp || show.postedDate || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                </div>
              </div>
              <div>
                <Label className="font-bold text-lg mb-2">Company Info</Label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-semibold text-[#7367F0]">{show.companyName || show.company}</div>
                </div>
                <div className="text-gray-700 text-base">{show.aboutCompany || show.companyDescription || ''}</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default page;