import React from "react";
import { Button } from "./ui/button";

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

  // generate a deterministic background color from a string
  const stringToHsl = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360; // hue
    const s = 60 + (Math.abs(hash) % 20); // saturation
    const l = 65; // lightness
    return `hsl(${h} ${s}% ${l}%)`;
  };

  const displaySalary = (sal?: string) => {
    if (!sal) return undefined;
    const lower = sal.toLowerCase();
    if (lower.includes('as per industry') || lower.includes('as per company') || lower.includes('not disclosed')) {
      return 'Not disclosed';
    }
    return sal;
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        // allow onApply when user clicks the card; interactive children will stop propagation
        onApply && onApply();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onApply && onApply();
        }
      }}
      className="group bg-white rounded-2xl p-6 shadow flex flex-col justify-between h-[250px] max-w-full w-full text-left transition-colors duration-200 hover:bg-[#7367F0] focus:outline-none overflow-hidden cursor-pointer"
    >
      <div className="flex justify-between">
        <div className="flex items-center gap-3 hover:text-white">
          {/* always use initial instead of logo to keep UI consistent */}
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            <div
              aria-hidden
              className="w-12 h-12 flex items-center justify-center rounded-md text-white font-bold"
              style={{ background: stringToHsl(company || 'U') }}
            >
              <span className="text-base sm:text-lg leading-none">{(company || 'U').charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-white"
              style={{
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
              title={title}
            >
              {title}
            </div>
            <div
              className="text-xs sm:text-sm text-gray-500 group-hover:text-white mt-0.5"
              style={{
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
              title={`${company} • ${location}`}
            >
              {company} <span className="mx-1">•</span> {location}
            </div>
          </div>
        </div>
        {/* posted/date removed to keep card sizes consistent */}
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="flex flex-wrap gap-2 max-w-[65%]">
          {tags.slice(0, 4).map((tag, i) => (
            <span
              key={tag + i}
              className="bg-[#ece9fe] text-[#7367F0] px-2 py-0.5 rounded-full text-xs font-medium group-hover:bg-[#a78bfa] group-hover:text-white max-w-[40%] truncate"
            >
              {tag}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="bg-[#ece9fe] text-[#7367F0] px-3 py-1 rounded-full text-xs font-medium group-hover:bg-[#a78bfa] group-hover:text-white whitespace-nowrap">more...</span>
          )}
        </div>
        {displaySalary(salary) && (
          <span className="text-sm sm:text-base text-[#7367F0] font-semibold group-hover:text-white ml-2 truncate">
            {displaySalary(salary)}
          </span>
        )}
      </div>
      <div className="flex gap-2 items-center w-full mt-4">
        {editMode && (
          <>
            <Button
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                OnEdit && OnEdit();
              }}
              className="rounded-lg h-10 w-1/2 bg-gradient-to-r from-pink-500 to-red-500 text-white flex items-center justify-center gap-2 shadow-none"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg h-10 w-1/2 border-[#7367F0] text-[#7367F0] flex items-center justify-center gap-2 shadow-none"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
              Insights
            </Button>
          </>
        )}
      </div>
  </div>
  );
};

export default JobCard;