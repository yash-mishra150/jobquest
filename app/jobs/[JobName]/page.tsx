"use client";

import * as React from 'react';
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Heart, Share2, CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
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
  logo: "",
  jobType: "Internship",
  experience: "0-1 years"
};

const page = () => {
  const params = useParams();
  const jobName = params.JobName;

  // read selected job details from sessionStorage if present
  const [remoteJob, setRemoteJob] = React.useState<any | null>(null);

  // verification state
  const [verifying, setVerifying] = React.useState(false);
  const [verified, setVerified] = React.useState<boolean | null>(null);
  const [confidence, setConfidence] = React.useState<number | null>(null);
  const [verifyMessage, setVerifyMessage] = React.useState<string>("");
  const [prediction, setPrediction] = React.useState<string | null>(null);
  const [probability, setProbability] = React.useState<number | null>(null);

  // Shape expected by ML verify API
  type VerifyJobPayload = {
    title: string;
    link: string;
    companyName: string;
    location: string;
    duration: string;
    stipend: string;
    earlyApplicant: boolean;
    skills: string[];
    jobDescription: string;
    aboutCompany: string;
    numberOfOpenings: string;
    timestamp: string; // ISO string
  };

  // Build a standardized payload from any job-like object
  const buildVerifyPayload = (job: any): VerifyJobPayload => {
    const skillsArrRaw = job?.skills || job?.skillsList || [];
    const skillsArr = Array.isArray(skillsArrRaw)
      ? skillsArrRaw.map((s: any) => (typeof s === "string" ? s : String(s))).filter(Boolean)
      : [];

    const tsRaw = job?.timestamp || job?.postedDate || jobData.timestamp || new Date().toISOString();
    const ts = (() => {
      try {
        const d = new Date(tsRaw);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      } catch {
        return new Date().toISOString();
      }
    })();

    return {
      title: (job?.title || "").toString(),
      link: (job?.link || "").toString(),
      companyName: (job?.companyName || job?.company || "").toString(),
      location: (job?.location || "").toString(),
      duration: ("Not specified").toString(),
      stipend: (job?.stipend || job?.salary || "Not disclosed").toString(),
      earlyApplicant: Boolean(job?.earlyApplicant || false),
      skills: skillsArr,
      jobDescription: (job?.jobDescription || job?.description|| "").toString(),
      aboutCompany: (job?.aboutCompany || job?.companyDescription || "").toString(),
      numberOfOpenings: (job?.numberOfOpenings || "1").toString(),
      timestamp: ts,
    };
  };

  // helper to call our server route which proxies to the ML verifier
  const verifyJob = async (jobLike?: any) => {
    const p = buildVerifyPayload(jobLike ?? show ?? jobData);

    try {
      setVerifying(true);
      setVerified(null);
      setConfidence(null);
      setVerifyMessage("");
      setPrediction(null);
      setProbability(null);

      const res = await fetch("/api/jobs/machine-learning/jobVerify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(p),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Verifier responded ${res.status}`);
      }

  const data = await res.json();
      if (typeof data === "object") {
        // New API shape example:
        // {
        //   status: "success",
        //   jobTitle: "Sales & Service Engineer",
        //   companyName: "OFFICE PLUS LIMITED",
        //   prediction: "LEGITIMATE" | "SCAM" | ...,
        //   probability: number, // often P(scam)
        //   confidence: number   // often P(legitimate)
        // }
        const hasPrediction = typeof data.prediction === 'string';
        const legit = hasPrediction ? String(data.prediction).toUpperCase() === 'LEGITIMATE' : undefined;
        const conf = typeof data.confidence === 'number' ? data.confidence
                    : (typeof data.score === 'number' ? data.score : null);

        setVerified(
          typeof data.verified === 'boolean' ? data.verified
          : typeof data.isVerified === 'boolean' ? data.isVerified
          : (typeof legit === 'boolean' ? legit : null)
        );
        setConfidence(conf);
        setPrediction(hasPrediction ? String(data.prediction) : null);
        setProbability(typeof data.probability === 'number' ? data.probability : null);
        const summary = hasPrediction ? `Prediction: ${data.prediction}` : undefined;
        setVerifyMessage(data.message || data.note || summary || JSON.stringify(data));
      } else {
        // fallback: truthy string -> verified
        setVerified(Boolean(data));
        setVerifyMessage(String(data));
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      setVerifyMessage(err?.message || "Verification error");
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  const imageVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const logoSrc = "/logos/blognation.png";

  const show = remoteJob || jobData;

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

  // auto-run verification when job data becomes available
  React.useEffect(() => {
    // `show` is derived below; only verify when we have a job object
    // we guard by checking remoteJob or jobData presence after initial mount
    const jobToVerify = remoteJob ?? jobData;
    if (!jobToVerify) return;
    // don't block UI, start verification with standardized payload
    verifyJob(jobToVerify);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteJob]);

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
                <a href={show.link || jobData.link} target="_blank" rel="noopener noreferrer">Apply Now</a>
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
                <div className="text-gray-700 text-base font-semibold mt-2">{show.experience || show.experienceRange || show.experience_required || 'Not specified'}</div>
              </div>
            </div>
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full md:max-w-xs flex-shrink-0 bg-[#f6f5fd] rounded-2xl p-6 shadow mt-16 md:mt-0"
            >
              {/* Verification panel */}
              <div className="mb-6">
                <Label className="font-bold text-lg mb-3">Verification</Label>
                <div className="flex flex-col gap-3">
                  {/* Status pill */}
                  <div className="flex items-center gap-2">
                    {verifying ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Checking authenticity…
                      </div>
                    ) : verified === true ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified {prediction ? `• ${String(prediction).toUpperCase()}` : ''}
                      </div>
                    ) : verified === false ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700">
                        <XCircle className="h-4 w-4" />
                        Not verified {prediction ? `• ${String(prediction).toUpperCase()}` : ''}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
                        <ShieldCheck className="h-4 w-4" />
                        Not verified yet
                      </div>
                    )}
                  </div>

                  {/* Confidence bar */}
                  {confidence !== null && (
                    <div>
                      <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                        <span>Confidence</span>
                        <span>{(confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${verified ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.max(0, Math.min(100, Math.round((confidence || 0) * 100)))}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Extra details */}
                  <div className="grid grid-cols-1 gap-1 text-[11px] text-gray-600">
                    {prediction && <div><span className="font-medium text-gray-700">Prediction:</span> {String(prediction).toUpperCase()}</div>}
                    {probability !== null && <div><span className="font-medium text-gray-700">Probability:</span> {(probability * 100).toFixed(0)}%</div>}
                  </div>

                  {/* Message / note */}
                  {verifyMessage && (
                    <div className="rounded-md bg-gray-50 border border-gray-200 p-2 text-[11px] text-gray-600">
                      {verifyMessage}
                    </div>
                  )}

                  <div className="mt-1">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => verifyJob(show)}
                      disabled={verifying}
                    >
                      {verifying ? "Verifying…" : "Re-verify Job"}
                    </Button>
                  </div>

                  <div className="text-[10px] text-gray-400">
                    This check uses a machine-learning model and may not be 100% accurate.
                  </div>
                </div>
              </div>
              {/* Job Details */}
              <div className="mb-6 border-t pt-4">
                <Label className="font-bold text-lg mb-2">Job Details</Label>
                <div className="flex flex-col gap-2 text-gray-700 text-base">
                  <div><span className="font-semibold">Stipend:</span> {show.stipend || show.salary || 'Not disclosed'}</div>
                  <div><span className="font-semibold">Employment Type:</span> {show.jobType || 'Not specified'}</div>
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