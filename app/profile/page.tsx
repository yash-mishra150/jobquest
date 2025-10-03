'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowUp, MapPin, Phone, Mail, Calendar, Briefcase, GraduationCap } from 'lucide-react';

// Interfaces for dynamic data
interface ContactInfo {
  phone: string;
  email: string;
  location: string;
}

interface ProfileData {
  id: string;
  name: string;
  title: string;
  location: string;
  activeDate: string;
  profileImage: string;
  coverImage: string;
  about: string;
  contactInfo: ContactInfo;
  professionalStatus: {
    status: string;
    statusColor: string;
    description: string;
  };
}

interface Skill {
  id: string;
  name: string;
}

interface TimelineItem {
  id: string;
  date: string;
  description: string;
}

interface WorkExperience extends TimelineItem {
  company?: string;
  position?: string;
}

interface Education extends TimelineItem {
  institution?: string;
  degree?: string;
}

const ProfilePage = () => {
  // Combined comprehensive profile data - would typically come from API/props
  const profileData = {
    profile: {
      id: '1',
      name: 'Marthe Alesi',
      title: 'Speech Pathologist',
      location: 'Dabachang',
      activeDate: 'February 2022',
      profileImage: '/images/profile/user-1.png',
      coverImage: '/officeBG.jpg',
      about: 'As a Human Resources Coordinator, you will work within a Product Delivery Team fused with UX, engineering, product and data talent. You will help the team design beautiful interfaces that solve business challenges for our clients. We work with a number of Tier 1 banks on building web-based applications for AML, KYC and Sanctions List management workflows. This role is ideal if you are looking to segue your career into the FinTech or Big Data arenas.',
      contactInfo: {
        phone: '770-911-4314',
        email: 'malesi1@themeforest.net',
        location: 'Dabachang'
      },
      professionalStatus: {
        status: 'Available for Work',
        statusColor: 'green',
        description: 'Open to new opportunities and collaborations in speech pathology and related fields.'
      }
    },
    skills: [
      { id: '1', name: 'javascript' },
      { id: '2', name: 'typescript' },
      { id: '3', name: 'react' },
      { id: '4', name: 'css' },
      { id: '5', name: 'html5' },
      { id: '6', name: 'node.js' },
      { id: '7', name: 'python' },
      { id: '8', name: 'figma' }
    ],
    workExperience: [
      {
        id: '1',
        title: 'Senior Developer',
        company: 'TechCorp Solutions',
        date: 'February 2022',
        dateDetail: 'Started on February 15th, 2022',
        description: 'Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.',
        status: 'Current',
        statusColor: 'blue'
      },
      {
        id: '2',
        title: 'Lead Designer',
        company: 'Digital Innovations',
        date: 'March 2021',
        dateDetail: 'March 10th, 2021 - January 2022',
        description: 'All of the pages and components are first designed in Figma and we keep a parity between the two versions even as we update the project.',
        status: null,
        statusColor: null
      },
      {
        id: '3',
        title: 'Frontend Developer',
        company: 'WebFlow Agency',
        date: 'April 2020',
        dateDetail: 'April 5th, 2020 - February 2021',
        description: 'Get started with dozens of web components and interactive elements built on top of Tailwind CSS.',
        status: null,
        statusColor: null
      }
    ],
    education: [
      {
        id: '1',
        degree: 'Master in Computer Science',
        institution: 'University of Technology',
        date: 'September 2018',
        dateDetail: 'Graduated on September 15th, 2018',
        description: 'Comprehensive program covering advanced software development, algorithms, and system design principles.',
        status: 'Graduated',
        statusColor: 'green'
      },
      {
        id: '2',
        degree: 'Certificate in UX/UI Design',
        institution: 'Design Institute',
        date: 'June 2017',
        dateDetail: 'Completed on June 20th, 2017',
        description: 'Specialized training in user experience design, interface development, and design thinking methodologies.',
        status: null,
        statusColor: null
      },
      {
        id: '3',
        degree: 'Full Stack Development Bootcamp',
        institution: 'Code Academy',
        date: 'December 2016',
        dateDetail: 'Completed on December 10th, 2016',
        description: 'Intensive bootcamp covering modern web development technologies and best practices.',
        status: null,
        statusColor: null
      }
    ]
  };

  const getStatusColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      green: 'bg-green-100 text-green-700',
      blue: 'bg-blue-100 text-blue-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      red: 'bg-red-100 text-red-700'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white min-h-screen pt-24">
      {/* Header Image */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex justify-center mt-5">        <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative w-full h-[32vh] md:h-[40vh]"
      >          <Image
          src={profileData.profile.coverImage}
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
            <Image
              src={profileData.profile.profileImage}
              alt={profileData.profile.name}
              width={80}
              height={80}
              className="rounded-2xl object-cover"
            />
          </div>
        </motion.div>
      </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-20 -mt-8 relative z-10">
        {/* Top row: profile info and actions */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >          {/* Profile Header with Animation */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col md:flex-row md:items-center md:gap-6 w-full"
          >            <div className="flex-1">
              <Label className="text-[#7367F0] font-semibold text-base mb-1">{profileData.profile.title}</Label>
              <h1 className="text-xl md:text-2xl font-semibold tracking-wide text-gray-900 leading-normal mb-1">{profileData.profile.name}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-base">
                <MapPin size={18} />
                {profileData.profile.location}
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
                <Calendar size={16} />
                Active since {profileData.profile.activeDate}
              </div>
            </div>
            <div className="flex gap-3 items-center mt-4 md:mt-0">
              <Button className="bg-[#7367F0] text-white font-semibold px-6 py-2 rounded-xl hover:bg-[#5b4acb]">
                Contact Me
              </Button>              <Button variant="outline" className="border-[#7367F0] text-[#7367F0] font-semibold px-6 py-2 rounded-xl hover:bg-[#f6f5fd]">
                Download CV
              </Button>
            </div>
          </motion.div>

          {/* Main content and sidebar */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 w-full">
            <div className="flex-1">              {/* About Section with Animation */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                className=""
              >
                <Label className="font-bold text-lg mb-2">About {profileData.profile.name}</Label>
                <p className="text-gray-700 leading-relaxed mt-2">
                  {profileData.profile.about}
                </p>
              </motion.div>              {/* Skills Section with Animation */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
                className="mt-8"
              >
                <Label className="font-bold text-lg mb-2">Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData.skills.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut", delay: 0.8 + (index * 0.1) }}
                    >
                      <Badge
                        className="bg-[#ece9fe] text-[#7367F0] px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {skill.name}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>              {/* Work Experience Section with Animation */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 1.2 }}
                className="mt-8"
              >
                <Label className="font-bold text-lg mb-2">Work Experience</Label>
                {/* Flowbite Inspired Timeline */}
                <ol className="relative border-s border-gray-200 mt-4 ms-3">
                  {profileData.workExperience.map((experience, index) => (
                    <motion.li
                      key={experience.id}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: 1.4 + (index * 0.2) }}
                      className={`${index !== profileData.workExperience.length - 1 ? 'mb-10' : ''} ms-6`}
                    >
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-[#ece9fe] rounded-full -start-3 ring-8 ring-white">
                        <Briefcase className="w-3 h-3 text-[#7367F0]" />
                      </span>
                      <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
                        {experience.title} at {experience.company}
                        {experience.status && (
                          <span className={`${getStatusColorClass(experience.statusColor)} text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm ms-3`}>
                            {experience.status}
                          </span>
                        )}
                      </h3>
                      <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                        {experience.dateDetail}
                      </time>                      <p className="mb-4 text-base font-normal text-gray-500">
                        {experience.description}
                      </p>
                    </motion.li>
                  ))}
                </ol>
              </motion.div>              {/* Education & Training Section with Animation */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 2.2 }}
                className="mt-8"
              >
                <Label className="font-bold text-lg mb-2">Education & Training</Label>
                {/* Flowbite Inspired Timeline */}
                <ol className="relative border-s border-gray-200 mt-4 ms-3">
                  {profileData.education.map((edu, index) => (
                    <motion.li
                      key={edu.id}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: 2.4 + (index * 0.2) }}
                      className={`${index !== profileData.education.length - 1 ? 'mb-10' : ''} ms-6`}
                    >
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-[#ece9fe] rounded-full -start-3 ring-8 ring-white">
                        <GraduationCap className="w-3 h-3 text-[#7367F0]" />
                      </span>
                      <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
                        {edu.degree} at {edu.institution}
                        {edu.status && (
                          <span className={`${getStatusColorClass(edu.statusColor)} text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm ms-3`}>
                            {edu.status}
                          </span>
                        )}
                      </h3>
                      <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                        {edu.dateDetail}
                      </time>                      <p className="mb-4 text-base font-normal text-gray-500">
                        {edu.description}
                      </p>
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            </div>

            {/* Right Sidebar - Contact Info */}
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full md:max-w-xs flex-shrink-0 bg-[#f6f5fd] rounded-2xl p-6 shadow mt-16 md:mt-0"
            >              <div className="mb-6">
                <Label className="font-bold text-lg mb-2">Contact Information</Label>
                <div className="flex flex-col gap-4 text-gray-700 text-base">
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-[#7367F0]" />
                    <span className="font-semibold">{profileData.profile.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-[#7367F0]" />
                    <span className="font-semibold break-all">{profileData.profile.contactInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-[#7367F0]" />
                    <span className="font-semibold">{profileData.profile.contactInfo.location}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="font-bold text-lg mb-2">Professional Status</Label>
                <div className="text-gray-700 text-base">
                  <div className={`${getStatusColorClass(profileData.profile.professionalStatus.statusColor)} px-3 py-1 rounded-full text-sm font-medium inline-block mb-2`}>
                    {profileData.profile.professionalStatus.status}
                  </div>
                  <p className="text-sm mt-2">{profileData.profile.professionalStatus.description}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Floating Back to Top Button */}
      <Button
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[#7367F0] hover:bg-[#5b4acb] shadow-lg"
        size="icon"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp className="w-5 h-5 text-white" />
      </Button>
    </div>
  );
};

export default ProfilePage;