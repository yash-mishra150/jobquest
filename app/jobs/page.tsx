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



const tags = ["App", "Administrative", "Android", "Wordpress", "Design", "React", "Marketing", "Trending"];

const page = () => {
  const router = useRouter();

  // Form / request state for the scrapper payload
  const [search, setSearch] = React.useState("software developer");
  const [pageNum, setPageNum] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(20);
  const [jobsInput, setJobsInput] = React.useState<string>("Frontend Developer,Backend Developer,Full Stack Developer");
  const [locationsInput, setLocationsInput] = React.useState<string>("Bangalore,Delhi,Hyderabad");
  const [workFromHome, setWorkFromHome] = React.useState(true);
  const [workFromOffice, setWorkFromOffice] = React.useState(false);
  const [hybrid, setHybrid] = React.useState(true);
  const [jobAge, setJobAge] = React.useState<string>("7d");
  const [maxDuration, setMaxDuration] = React.useState<number>(12);
  const [startDate, setStartDate] = React.useState<string>("2025-11-01");
  const [jobOffer, setJobOffer] = React.useState(true);
  const [fetchDetails, setFetchDetails] = React.useState(false);
  const [saveToFile, setSaveToFile] = React.useState(true);
  const [_isTestRequest, setIsTestRequest] = React.useState(false);
  const [useThreads, setUseThreads] = React.useState(true);
  const [_fastMode, setFastMode] = React.useState(false);
  const [_minimizeDetails, setMinimizeDetails] = React.useState(true);
  const [_skipDescriptions, setSkipDescriptions] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // responsive skeleton count to fill the grid on different screen sizes
  const [skeletonCount, setSkeletonCount] = React.useState<number>(6);

  React.useEffect(() => {
    const compute = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      // Tailwind breakpoints approx: sm=640, md=768, lg=1024
      let cols = 1;
      if (w >= 1024) cols = 3;
      else if (w >= 640) cols = 2;
      const rows = 3; // show ~3 rows of skeletons
      // show one fewer skeleton than full grid so it looks less heavy
      setSkeletonCount(Math.max(1, cols * rows - 1));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // jobResults holds the list of job items to render. Start empty and load featured jobs on mount
  const [jobResults, setJobResults] = React.useState<any[]>([]);
  const [totalCount, setTotalCount] = React.useState<number | null>(null);

  // fetch featured jobs on mount to populate the page initially
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/jobs/featured');
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.data || data.results || [];
        const mapped = items.map((item: any) => ({
          logo: item.logo || item.company_logo || item.logo_url || "/images/profile/user-1.png",
          company: item.company || item.employer || item.company_name || item.companyName || item.source || "Unknown",
          location: item.location || item.city || item.town || item.location || "Remote",
          title: item.title || item.position || item.job_title || "Untitled",
          tags: item.tags || item.skills || (item.category ? [item.category] : []) || [],
          salary: item.salary || item.compensation || undefined,
          posted: item.posted || item.age || item.posted_at || item.postedDate || undefined,
          raw: item,
        }));

        if (!mounted) return;
        setJobResults(mapped);
        if (typeof data.total === 'number') setTotalCount(data.total);
      } catch (e) {
        console.error('Failed to load featured jobs', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Helper to build request payload from the form state
  const buildPayload = () => ({
    search,
    page: pageNum,
    size,
    jobs: jobsInput.split(",").map((s) => s.trim()).filter(Boolean),
    locations: locationsInput.split(",").map((s) => s.trim()).filter(Boolean),
    work_from_home: workFromHome,
    work_from_office: workFromOffice,
    hybrid,
    jobAge,
    max_duration: maxDuration,
    start_date: startDate,
    job_offer: jobOffer,
    fetchDetails,
    saveToFile,
    _isTestRequest,
    useThreads,
    _fastMode,
    _minimizeDetails,
    _skipDescriptions,
  });

  // Submit handler to call the Next.js route
  // generic fetch function which can be used for initial search and for pagination
  const fetchJobs = async (pageOverride?: number) => {
    const pageToUse = pageOverride ?? pageNum;
    setLoading(true);
    setError(null);

    try {
      const payload = { ...buildPayload(), page: pageToUse };

      const res = await fetch('/api/jobs/scrapper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed: ${res.status} ${text}`);
      }

      const data = await res.json();

      const results = Array.isArray(data)
        ? data
        : data.data || data.jobs || data.results || data.items || [];

      const mapped = results.map((item: any) => ({
        logo:
          item.logo || item.company_logo || item.logo_url || item.logoUrl || "/images/profile/user-1.png",
        company:
          item.company || item.employer || item.company_name || item.companyName || item.source || "Unknown",
        location: item.location || item.city || item.town || "Remote",
        title: item.title || item.position || item.job_title || "Untitled",
        tags: item.tags || item.skills || (item.category ? [item.category] : []) || [],
        salary: item.salary || item.compensation || undefined,
        posted: item.posted || item.age || item.posted_at || item.postedDate || undefined,
        raw: item,
      }));

      setJobResults(mapped);
      setPageNum(pageToUse);
      if (typeof data.total === 'number') setTotalCount(data.total);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await fetchJobs(1); // start search from page 1
  };

  React.useEffect(() => {
    // Optionally, fetch immediately on mount. Comment out if undesired.
    // handleSubmit();
  }, []);

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
              <form onSubmit={handleSubmit} className="bg-[#f6f5fd] rounded-[24px] p-6 w-full lg:max-w-[400px]">
                <Label className="block text-xl font-bold mb-4">Search by Keywords</Label>
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title, keywords, or company"
                  disabled={loading}
                  className="w-full h-[6.5vh] mb-4 px-6 py-0 rounded-[12px] bg-white text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa] border-none disabled:opacity-60"
                />

                <Label className="block text-sm font-medium mb-2">Jobs (comma separated)</Label>
                <Input
                  type="text"
                  value={jobsInput}
                  onChange={(e) => setJobsInput(e.target.value)}
                  placeholder="Frontend Developer, Backend Developer"
                  disabled={loading}
                  className="w-full h-[5vh] mb-3 px-4 py-0 rounded-[10px] bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#a78bfa] border-none disabled:opacity-60"
                />

                <Label className="block text-xl font-bold mb-4">Location</Label>
                <Input
                  type="text"
                  value={locationsInput}
                  onChange={(e) => setLocationsInput(e.target.value)}
                  placeholder="City or postcode"
                  disabled={loading}
                  className="w-full h-[6.5vh] px-6 py-0 rounded-[12px] bg-white text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa] border-none disabled:opacity-60"
                />

                <div className="flex items-center gap-2 mt-4">
                  <Button type="submit" className="rounded-xl" disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
                  <Button variant="outline" type="button" onClick={() => { setJobResults([]); setTotalCount(null); }} className="rounded-xl" disabled={loading}>Reset</Button>
                </div>
              </form>
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
              <div className="text-lg font-semibold text-gray-700">Show <span className="font-bold">{totalCount ?? jobResults.length}</span> jobs</div>
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
              {loading ? (
                // show skeleton cards while loading (responsive count)
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow animate-pulse min-h-[220px]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16" />
                      <div className="h-6 bg-gray-200 rounded w-12" />
                      <div className="h-6 bg-gray-200 rounded w-20" />
                    </div>
                    <div className="mt-6 h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                ))
              ) : (
                jobResults.map((job, idx) => (
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
                      onApply={() => {
                        try {
                          // save raw job to sessionStorage so details page can read it
                          const raw = (job as any).raw;
                          if (raw) {
                            sessionStorage.setItem('selectedJob', JSON.stringify(raw));
                          }
                        } catch (e) {
                          // ignore storage errors
                        }
                        router.push(`/jobs/${encodeURIComponent((job.title || '').replace(/\s+/g, "-"))}`);
                      }}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
            {/* Pagination controls */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                disabled={loading || pageNum <= 1}
                onClick={() => fetchJobs(pageNum - 1)}
              >
                Prev
              </Button>

              {/* page numbers: show up to 5 pages around current */}
              <div className="flex items-center gap-2">
                {(() => {
                  const totalPages = totalCount ? Math.max(1, Math.ceil(totalCount / size)) : null;
                  if (!totalPages) return <span className="text-sm text-gray-600">Page {pageNum}</span>;

                  const pages = [] as number[];
                  const start = Math.max(1, pageNum - 2);
                  const end = Math.min(totalPages, pageNum + 2);
                  for (let p = start; p <= end; p++) pages.push(p);

                  return pages.map((p) => (
                    <button
                      key={p}
                      className={`px-3 py-1 rounded ${p === pageNum ? 'bg-[#7367F0] text-white' : 'bg-white border'}`}
                      onClick={() => fetchJobs(p)}
                      disabled={loading}
                    >
                      {p}
                    </button>
                  ));
                })()}
              </div>

              <Button
                variant="outline"
                disabled={loading || (totalCount ? pageNum >= Math.ceil(totalCount / size) : false)}
                onClick={() => fetchJobs(pageNum + 1)}
              >
                Next
              </Button>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default page;