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
}

const JobCard: React.FC<JobCardProps> = ({ logo, company, location, title, tags = [], salary, posted, onApply }) => {
  return (
    <button
      type="button"
      onClick={onApply}
      className="group bg-white rounded-2xl p-6 shadow flex flex-col gap-2 min-h-[180px] max-w-full w-full text-left transition-colors duration-200 hover:bg-[#7367F0] hover:text-white focus:outline-none"
    >
      <div className="flex items-center gap-3">
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
          <div className="font-bold text-lg text-gray-900 truncate group-hover:text-white">{title}</div>
          <div className="text-sm text-gray-500 truncate group-hover:text-white">{company} <span className="mx-1">•</span> {location}</div>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mt-2">
        {tags.map((tag) => (
          <span key={tag} className="bg-[#ece9fe] text-[#7367F0] px-3 py-1 rounded-full text-xs font-medium group-hover:bg-[#a78bfa] group-hover:text-white">{tag}</span>
        ))}
      </div>
      <div className="flex justify-between items-center mt-2">
        {posted && (
          <span className="text-xs text-gray-400 flex items-center gap-1 group-hover:text-white">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 8v4l3 1"/></svg>
            {posted}
          </span>
        )}
        {salary && (
          <span className="text-base text-[#7367F0] font-semibold group-hover:text-white">{salary}</span>
        )}
      </div>
    </button>
  );
};

export default JobCard;
