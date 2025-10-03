"use client";

import * as React from 'react';
import { BriefcaseBusiness, Bell, MessagesSquare, Users } from 'lucide-react';
import { ChartAreaGradient } from "@/components/ChartAreaGradient";
import { BarChartCustom } from '@/components/BarChartCustom';

const page = () => {
  const dashboardData = {
    openJobs: 12,
    activeAlerts: 7,
    messages: 74,
    shortlisted: 32,
  };

  const UseCountUp = (target: number, duration = 800) => {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
      let start = 0;
      const step = Math.ceil(target / (duration / 16));
      if (target === 0) return setCount(0);
      const interval = setInterval(() => {
        start += step;
        if (start >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(start);
        }
      }, 16);
      return () => clearInterval(interval);
    }, [target, duration]);
    return count;
  }

  const openJobs = UseCountUp(dashboardData.openJobs);
  const activeAlerts = UseCountUp(dashboardData.activeAlerts);
  const messages = UseCountUp(dashboardData.messages);
  const shortlisted = UseCountUp(dashboardData.shortlisted);

  const applicants = [
    { name: "Henry Wilson", job: "Product Designer", color: "#2563eb", bg: "#e3edfd", icon: <BriefcaseBusiness className="w-6 h-6 text-[#2563eb]" /> },
    { name: "Raul Costa", job: "Product Manager, Risk", color: "#22c55e", bg: "#eafaf3", icon: <Users className="w-6 h-6 text-[#22c55e]" /> },
    { name: "Jack Milk", job: "Technical Architect", color: "#2563eb", bg: "#e3edfd", icon: <BriefcaseBusiness className="w-6 h-6 text-[#2563eb]" /> },
    { name: "Michel Arian", job: "Software Engineer", color: "#22c55e", bg: "#eafaf3", icon: <Users className="w-6 h-6 text-[#22c55e]" /> },
    { name: "Wade Warren", job: "Web Developer", color: "#2563eb", bg: "#e3edfd", icon: <BriefcaseBusiness className="w-6 h-6 text-[#2563eb]" /> },
  ];
  
  return (
    <div className="w-full p-10 pt-6 bg-gray-100">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
          <div className="bg-[#e3edfd] rounded-lg p-2 md:p-3 flex items-center justify-center">
            <BriefcaseBusiness className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#2563eb]" />
          </div>
          <div className="flex flex-col items-end ml-auto">
            <span className="text-base md:text-lg lg:text-xl font-bold text-[#2563eb]">{openJobs}</span>
            <div className="mt-1 text-xs md:text-sm lg:text-base font-medium text-gray-800 text-right">Jobs Posted</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
          <div className="bg-[#fdeaea] rounded-lg p-2 md:p-3 flex items-center justify-center">
            <Bell className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#e53e3e]" />
          </div>
          <div className="flex flex-col items-end ml-auto">
            <span className="text-base md:text-lg lg:text-xl font-bold text-[#e53e3e]">{activeAlerts}</span>
            <div className="mt-1 text-xs md:text-sm lg:text-base font-medium text-gray-800 text-right">Applicants</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
          <div className="bg-[#eafaf3] rounded-lg p-2 md:p-3 flex items-center justify-center">
            <Users className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#22c55e]" />
          </div>
          <div className="flex flex-col items-end ml-auto">
            <span className="text-base md:text-lg lg:text-xl font-bold text-[#22c55e]">{shortlisted}</span>
            <div className="mt-1 text-xs md:text-sm lg:text-base font-medium text-gray-800 text-right">Job Closed</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
          <div className="bg-[#fff7e6] rounded-lg p-2 md:p-3 flex items-center justify-center">
            <MessagesSquare className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#f59e00]" />
          </div>
          <div className="flex flex-col items-end ml-auto">
            <span className="text-base md:text-lg lg:text-xl font-bold text-[#f59e00]">{messages}%</span>
            <div className="mt-1 text-xs md:text-sm lg:text-base font-medium text-gray-800 text-right">Hire Sucess</div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2 min-h-[40vh]">
          <ChartAreaGradient />
        </div>
        <div className="w-full lg:w-1/2 min-h-[40vh]">
          <BarChartCustom />
        </div>
      </div>
      <div className="mt-5 flex flex-col lg:flex-row gap-6">
        <div className="w-full">
          <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Recent Applicants</h2>
            <ul className="space-y-6 overflow-y-auto flex-1">
              {applicants.map((app, idx) => (
                <li key={idx} className="flex items-center gap-4">
                  <div className="rounded-full flex items-center justify-center" style={{ background: app.bg, padding: '0.75rem' }}>
                    {app.icon}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{app.name}</span>
                    <span className="text-gray-500"> applied for a job </span>
                    <span className="font-medium cursor-pointer" style={{ color: app.color }}>{app.job}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;