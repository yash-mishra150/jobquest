"use client";

import HeroSection from "@/components/HeroSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import * as React from "react";
import {
  ArrowRight,
  Code2,
  BarChart2,
  Monitor,
  Paintbrush,
  Layout,
  Megaphone,
  DollarSign,
  Users,
  Star,
  Heart,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

const CATEGORY_HEADING = "Search by Category";

const categories = [
  {
    icon: <Monitor size={40} className="text-[#a78bfa]" />,
    title: "Web Development",
    positions: 12,
  },
  {
    icon: <BarChart2 size={40} className="text-[#a78bfa]" />,
    title: "Data Science",
    positions: 8,
  },
  {
    icon: <Code2 size={40} className="text-[#a78bfa]" />,
    title: "Machine Learning",
    positions: 10,
  },
  {
    icon: <Paintbrush size={40} className="text-[#a78bfa]" />,
    title: "UI/UX Design",
    positions: 6,
  },
  {
    icon: <Layout size={40} className="text-[#a78bfa]" />,
    title: "Product Management",
    positions: 5,
  },
  {
    icon: <Megaphone size={40} className="text-[#a78bfa]" />,
    title: "Digital Marketing",
    positions: 7,
  },
  {
    icon: <DollarSign size={40} className="text-[#a78bfa]" />,
    title: "Finance & Accounting",
    positions: 4,
  },
  {
    icon: <Users size={40} className="text-[#a78bfa]" />,
    title: "Human Resources",
    positions: 3,
  },
];

const testimonials = [
  {
    avatar: "/images/profile/user-1.png",
    name: "Jenny Missy",
    role: "Web Developer",
    text: "JobQuest helped me land my dream job! The platform is intuitive and the support team is amazing. Highly recommended for job seekers.",
  },
  {
    avatar: "/avatars/avatar2.png",
    name: "Carlos Rivera",
    role: "Data Scientist",
    text: "I found several exciting opportunities through JobQuest. The application process was smooth and efficient.",
  },
  {
    avatar: "/avatars/avatar3.png",
    name: "Priya Sharma",
    role: "UI/UX Designer",
    text: "The job listings are always up-to-date and relevant. I appreciate the personalized recommendations!",
  },
  {
    avatar: "/avatars/avatar4.png",
    name: "Michael Lee",
    role: "Product Manager",
    text: "JobQuest connects you with top companies and makes job searching stress-free. Fantastic experience!",
  },
];

// Featured jobs data
const featuredJobs = [
  {
    title: "Nuclear Power Engineer",
    company: "Yata",
    type: "Residential",
    location: "Pereira",
    remote: true,
    fullTime: true,
    jobsAvailable: 18,
    logo: "/images/profile/user-1.png",
  },
  {
    title: "Technical Writer",
    company: "Blognation",
    type: "Residential",
    location: "Solna",
    remote: true,
    fullTime: true,
    jobsAvailable: 18,
    // logo: "/logos/blognation.png",
  },
  {
    title: "Professor",
    company: "Mynte",
    type: "Residential",
    location: "Minchinabad",
    remote: true,
    fullTime: true,
    jobsAvailable: 18,
    // logo: "/logos/mynte.png",
  },
  {
    title: "Financial Advisor",
    company: "Voonder",
    type: "Residential",
    location: "Obrenovac",
    remote: true,
    fullTime: true,
    jobsAvailable: 18,
    // logo: "/logos/voonder.png",
  },
  {
    title: "Associate Professor",
    company: "Abata",
    type: "Residential",
    location: "Thị Trấn Nho Quan",
    remote: true,
    fullTime: true,
    jobsAvailable: 18,
    // logo: "/logos/abata.png",
  },
  {
    title: "GIS Technical Architect",
    company: "Linktype",
    type: "Residential",
    location: "Velká nad Veličkou",
    remote: true,
    fullTime: true,
    jobsAvailable: 18,
    // logo: "/logos/linktype.png",
  },
];

function Clients() {
  const headingVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };
  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, delay: i * 0.15 },
    }),
  };
  return (
    <div className="bg-[#6c3ebf] w-full py-24 px-4 sm:px-6 lg:px-30 flex flex-col items-center justify-center min-h-[600px]">
      <motion.h1
        initial="hidden"
        animate="visible"
        variants={headingVariants}
        className="text-2xl font-bold text-center tracking-tight text-white sm:text-3xl lg:text-4xl mb-2"
      >
        Why Our Clients Admire Us
      </motion.h1>
      <motion.p
        initial="hidden"
        animate="visible"
        variants={headingVariants}
        transition={{ delay: 0.2 }}
        className="mt-2 text-sm text-center text-neutral-300 sm:text-base mb-10"
      >
        Testimonials that Showcase our Exceptional Service and Dedication
      </motion.p>

      <div className="relative w-full max-w-8xl">
        <Carousel>
          <CarouselContent>
            {testimonials.map((t, idx) => (
              <CarouselItem
                key={idx}
                className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex flex-col items-center min-w-[260px] max-w-full"
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  custom={idx}
                  variants={cardVariants}
                  className="flex flex-col items-center w-full"
                >
                  <div className="relative w-full h-full flex flex-col items-center">
                    {/* Avatar overlaps the card */}
                    <div className="absolute left-1/2 -translate-x-1/2 z-30">
                      <Avatar className="w-20 h-20 border-4 border-[#6c3ebf] bg-white">
                        <AvatarImage asChild>
                          <Image
                            src={t.avatar}
                            alt={t.name}
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                          />
                        </AvatarImage>
                        <AvatarFallback className="w-20 h-20 flex items-center justify-center rounded-full text-[#6c3ebf] bg-white text-2xl font-bold">
                          {t.name.split(" ")[0][0]}
                          {t.name.split(" ")[1] ? t.name.split(" ")[1][0] : ""}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {/* Card with extra top padding for avatar overlap */}
                    <div className="bg-[#232b3b] rounded-2xl pt-14 pb-6 px-8 mt-10 w-full h-full flex flex-col justify-between min-h-[260px] max-h-[320px] sm:min-h-[280px] sm:max-h-[340px] md:min-h-[300px] md:max-h-[360px] lg:min-h-[320px] lg:max-h-[380px] xl:min-h-[340px] xl:max-h-[400px] max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
                      <div>
                        <div className="font-bold text-white text-lg mb-2">
                          Thank you
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              className="text-orange-500 fill-orange-500"
                            />
                          ))}
                        </div>
                        <div className="text-base text-neutral-300 mb-4 leading-relaxed">
                          {t.text}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white text-base">
                          {t.name}
                        </div>
                        <div className="text-[#a78bfa] text-sm mt-1">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Dots */}
          <div className="flex justify-center items-center mt-6 gap-1">
            {testimonials.map((_, idx) => (
              <span
                key={idx}
                className="w-2 h-2 rounded-full bg-white/40 inline-block"
              />
            ))}
          </div>
          <div className="absolute right-20 bottom-8 z-30">
            <Button
              variant="default"
              className="absolute top-1/2 -translate-y-1/2 p-0 m-0 bg-transparent border-none outline-none cursor-pointer"
            >
              <CarouselPrevious
                variant="default"
                className="w-12 h-12 rounded-r-sm rounded- bg-white hover:bg-slate-100 text-[#a78bfa]"
              />
            </Button>
            <Button className="absolute top-1/2 -translate-y-1/2 p-0 m-0 bg-transparent border-none outline-none cursor-pointer">
              <CarouselNext
                variant="default"
                className="w-12 h-12 rounded-l bg-white hover:bg-slate-100 text-[#a78bfa]"
              />
            </Button>
          </div>
        </Carousel>
      </div>
    </div>
  );
}

function FeaturedJobs() {
  const [liked, setLiked] = React.useState(
    Array(featuredJobs.length).fill(false)
  );
  const handleLike = (idx: number) => {
    setLiked((prev) => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
  };
  return (
    <div className="px-4 py-12 mt-10 sm:px-6 lg:px-30">
      <div className="mx-auto max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-left">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Featured Job Offers
          </h1>
          <p className="mt-2 text-sm text-neutral-400 sm:text-base">
            Explore Exciting Opportunities with Prominent Employers
          </p>
        </div>
        <Button variant="link" className="self-start sm:self-auto px-0">
          <Link
            href="/jobs"
            className="flex items-center gap-2 text-[#7367F0] text-base font-semibold"
          >
            All Job Offers
            <ArrowRight size={20} color="#7367F0" />
          </Link>
        </Button>
      </div>
      <div className="mx-auto max-w-7xl mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {featuredJobs.map((job, idx) => (
          <div
            key={idx}
            className="bg-white hover:bg-[#7c3aed] transition-colors duration-300 rounded-2xl p-5 sm:p-6 shadow flex flex-col gap-4 group min-h-[260px] max-w-full"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white shrink-0">
                {job.logo ? (
                  <Image
                    src={job.logo}
                    alt={job.company}
                    width={40}
                    height={40}
                  />
                ) : (
                  <Avatar className="w-12 h-12 bg-[#ece9fe]">
                    <AvatarFallback className="w-12 h-12 flex items-center justify-center rounded-lg text-[#7367F0] bg-[#ece9fe] text-xl font-bold">
                      {job.company.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg text-gray-900 group-hover:text-white truncate">
                  {job.title}
                </div>
                <div className="text-sm text-gray-500 group-hover:text-white truncate">
                  by {job.company} in{" "}
                  <span className="text-[#7367F0] group-hover:text-[#c4b5fd]">
                    {job.type}
                  </span>
                </div>
              </div>
              <div className="ml-auto flex gap-2 items-center">
                <span className="text-orange-400">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M13 2.05v4.02a7.001 7.001 0 0 1 6.93 6.93h4.02A11.001 11.001 0 0 0 13 2.05ZM11 2.05A11.001 11.001 0 0 0 2.05 13h4.02A7.001 7.001 0 0 1 11 6.07V2.05ZM2.05 11A11.001 11.001 0 0 0 13 21.95v-4.02a7.001 7.001 0 0 1-6.93-6.93H2.05ZM21.95 13A11.001 11.001 0 0 0 13 2.05v4.02a7.001 7.001 0 0 1 6.93 6.93h4.02Z"
                    ></path>
                  </svg>
                </span>
                <motion.span
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="cursor-pointer"
                  onClick={() => handleLike(idx)}
                >
                  <Heart
                    size={28}
                    stroke={liked[idx] ? "#fff" : "#7367F0"}
                    fill={liked[idx] ? "#f472b6" : "none"}
                    className={`transition-all duration-300 ${
                      liked[idx] ? "group-hover:scale-125" : ""
                    }`}
                  />
                </motion.span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {job.remote && (
                <span className="bg-[#ece9fe] text-[#7367F0] group-hover:bg-[#a78bfa] group-hover:text-white px-3 py-1 rounded-full text-xs font-medium">
                  Remote
                </span>
              )}
              {job.fullTime && (
                <span className="bg-[#ece9fe] text-[#7367F0] group-hover:bg-[#a78bfa] group-hover:text-white px-3 py-1 rounded-full text-xs font-medium">
                  Full Time
                </span>
              )}
              <span className="bg-[#d7fbe8] text-[#3ecf8e] group-hover:bg-[#bbf7d0] group-hover:text-[#166534] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
                  ></path>
                </svg>
                {job.location}
              </span>
            </div>
            <div className="mt-2 text-[#7367F0] group-hover:text-white text-sm font-semibold">
              {job.jobsAvailable} Jobs Available
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Home = () => {
  const categoryVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: i * 0.12 },
    }),
  };

  return (
    <div>
      <HeroSection />
      <div className="px-4 py-12 mt-10 sm:px-6 lg:px-30">
        {/* Heading and View All */}
        <div className="mx-auto max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { y: 50, opacity: 0, scale: 0.95 },
              visible: {
                y: 0,
                opacity: 1,
                scale: 1,
                transition: { duration: 0.6 },
              },
            }}
            className="text-left"
          >
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
              {CATEGORY_HEADING}
            </h1>
            <p className="mt-2 text-sm text-neutral-400 sm:text-base">
              Explore Exciting Opportunities in the Digital World
            </p>
          </motion.div>
          <Button variant="link" className="self-start sm:self-auto px-0">
            <Link
              href="/categories"
              className="flex items-center gap-2 text-[#7367F0] text-base font-semibold"
            >
              View All
              <ArrowRight size={20} color="#7367F0" />
            </Link>
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="mx-auto max-w-7xl mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.title}
              initial="hidden"
              animate="visible"
              custom={idx}
              variants={categoryVariants}
              className="flex flex-col items-center text-center p-10 rounded-lg bg-white transition cursor-pointer group"
            >
              <div className="transition-colors duration-200 group-hover:text-[#6c3ebf] text-[#a78bfa]">
                {React.cloneElement(cat.icon, {
                  className: "text-inherit",
                  color: "currentColor",
                })}
              </div>
              <div className="mt-6 font-bold text-lg text-gray-900 group-hover:text-[#6c3ebf] transition-colors duration-200">
                {cat.title}
              </div>
              <div className="mt-3 text-sm text-gray-400">Explore Jobs</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Jobs Section */}
      <FeaturedJobs />

      {/* Clients Admire */}
      <Clients />
    </div>
  );
};

export default Home;
