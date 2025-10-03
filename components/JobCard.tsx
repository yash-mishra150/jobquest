import React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface JobCardProps {
  logo?: string;
  company: string;
  location: string;
  title: string;
  tags?: string[];
  salary?: string;
  posted?: string;
  onApply?: () => void;
  editMode?: boolean;
  OnEdit?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  logo,
  company,
  location,
  title,
  tags = [],
  salary,
  posted,
  onApply,
  editMode = false,
  OnEdit,
}) => {
  return (
    <button
      type="button"
      onClick={onApply}
      className="group bg-white rounded-2xl p-6 shadow flex flex-col justify-between min-h-[220px] max-w-full w-full text-left transition-colors duration-200 hover:bg-[#7367F0] focus:outline-none"
    >
      <div className="flex justify-between">
        <div className="flex items-center gap-3 hover:text-white">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white shrink-0">
            {logo ? (
              <Image src={logo} alt={company} width={40} height={40} />
            ) : (
              <Avatar className="w-12 h-12 bg-[#ece9fe]">
                <AvatarFallback className="w-12 h-12 flex items-center justify-center rounded-lg text-[#7367F0] bg-[#ece9fe] text-xl font-bold">
                  {company.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg text-gray-900 truncate group-hover:text-white">
              {title}
            </div>
            <div className="text-sm text-gray-500 truncate group-hover:text-white">
              {company} <span className="mx-1">•</span> {location}
            </div>
          </div>
        </div>
        {posted && (
          <span className="text-xs text-gray-400 flex items-center gap-1 group-hover:text-white">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 8v4l3 1" />
            </svg>
            {posted}
          </span>
        )}
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="flex flex-wrap gap-2 max-w-[65%]">
          {tags.slice(0, 4).map((tag, i) => (
            <span
              key={tag + i}
              className="bg-[#ece9fe] text-[#7367F0] px-3 py-1 rounded-full text-xs font-medium group-hover:bg-[#a78bfa] group-hover:text-white whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="bg-[#ece9fe] text-[#7367F0] px-3 py-1 rounded-full text-xs font-medium group-hover:bg-[#a78bfa] group-hover:text-white whitespace-nowrap">more...</span>
          )}
        </div>
        {salary && (
          <span className="text-base text-[#7367F0] font-semibold group-hover:text-white ml-2">
            {salary}
          </span>
        )}
      </div>
      <div className="flex gap-2 items-center w-full mt-4">
        {editMode && (
          <>
            <Button
              variant="default"
              onClick={OnEdit}
              className="rounded-lg h-10 w-1/2 bg-gradient-to-r from-pink-500 to-red-500 text-white flex items-center justify-center gap-2 shadow-none"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
              Edit
            </Button>
            <Button
              variant="outline"
              className="rounded-lg h-10 w-1/2 border-[#7367F0] text-[#7367F0] flex items-center justify-center gap-2 shadow-none"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
              Insights
            </Button>
          </>
        )}
      </div>
    </button>
  );
};

export default JobCard;
