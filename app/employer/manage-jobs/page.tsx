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

const Page = () => {
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [editJob, setEditJob] = React.useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;
    async function fetchJobs() {
      setLoading(true);
      try {
        const res = await fetch("/api/jobs/get");
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const result = await res.json();
        // Expecting { success, message, data: [...] }
        if (!ignore) {
          setJobs(Array.isArray(result.data) ? result.data : []);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        if (!ignore) setJobs([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchJobs();
    return () => { ignore = true; };
  }, []);


const jobFormConfig: FormFieldConfig[] = [
  { name: "title", label: "Job Title", type: "text", required: true },
  { name: "workMode", label: "Work Mode", type: "select", required: true, options: [
    { value: "hybrid", label: "Hybrid" },
    { value: "remote", label: "Remote" },
    { value: "offline", label: "Offline" },
  ] },
  { name: "skills", label: "Skills", type: "tags", required: true, fullWidth: true },
  { name: "experienceNeeded", label: "Experience Needed (years)", type: "text", required: true, regex: "^\\d+$" },
  {
    name: "salary",
    label: "Salary",
    type: "text",
    required: false,
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

const formRef = React.useRef<HTMLFormElement>(null) as React.RefObject<HTMLFormElement>;

  const handleFormSubmit = React.useCallback(async (values: { [key: string]: unknown | undefined }) => {
    setLoading(true);
    try {
      let res;
      if (editJob && editJob._id) {
        // Update job
        res = await fetch(`/api/jobs/update/${editJob._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        // Create job
        res = await fetch("/api/jobs/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }
      if (!res.ok) throw new Error(editJob ? "Failed to update job" : "Failed to create job");
      // Refresh job list
      const jobRes = await fetch("/api/jobs/get");
      const jobData = await jobRes.json();
      setJobs(Array.isArray(jobData.data) ? jobData.data : []);
      if (formRef.current) formRef.current.reset();
      setEditJob(null);
      setDialogOpen(false);
    } catch (_err) {
      console.error("Error submitting form:", _err);
    } finally {
      setLoading(false);
    }
  }, [editJob]);

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
            />
            {dialogOpen && editJob && (
              <DynamicForm
                formRef={formRef}
                buttonTitle={"Edit a Job"}
                hideTrigger={true}
                open={dialogOpen}
                onOpenChange={(o) => {
                  if (!o) {
                    setDialogOpen(false);
                    setEditJob(null);
                  }
                }}
                config={jobFormConfig}
                onSubmit={async (values: any) => {
                  await handleFormSubmit(values);
                  setDialogOpen(false);
                  setEditJob(null);
                }}
                title={"Edit a Job"}
                description={"Edit the details of the job."}
                submitButtonText={"Update"}
                drawerHeight={"h-[100vh]"}
                defaultValues={{
                  title: editJob.title || "",
                  workMode: editJob.workMode || "",
                  skills: Array.isArray(editJob.skills) ? editJob.skills : [],
                  experienceNeeded: (editJob.experienceNeeded ?? editJob.experience ?? "")?.toString?.() || "",
                  salary: editJob.salary || "",
                  description: editJob.description || "",
                }}
              />
            )}
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
        {loading ? (
          <div className="col-span-2 text-center py-10 text-gray-500">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="col-span-2 text-center py-10 text-gray-500">No jobs found.</div>
        ) : (
          jobs.map((job, idx) => (
            <motion.div
              key={`${job.title}-${job.workMode}-${idx}`}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { y: 40, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={idx % 2 === 0 ? "bg-[#f6f5fd]" : ""}
            >
              <JobCard
                {...job}
                tags={job.skills}
                salary={job.salary}
                editMode={true}
                 OnEdit={() => {
                   setEditJob(job);
                   setDialogOpen(true);
                 }}
              />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}

export default Page;
