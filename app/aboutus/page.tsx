import Image from "next/image";
import * as React from 'react';
import { Button } from "@/components/ui/button";

// Props placeholder: avoid empty-object type which ESLint flags
type Props = Record<string, unknown>;

const page = ({ }: Props) => {
  const projects = [
    { name: "JobQuest — Careers Portal", url: "https://github.com/yash-mishra150" },
    { name: "Portfolio Site", url: "https://github.com/yash-mishra150" },
    { name: "Small Product Prototype", url: "#" },
  ];

  const skills = ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "Vercel", "Git"];

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full px-6 py-12">
        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* profile image */}
          <div className="md:col-span-1 flex justify-center md:justify-start">
            <div className="w-44 h-44 sm:w-48 sm:h-48 md:w-64 md:h-64 relative rounded-full overflow-hidden ring-4 ring-white shadow-lg">
              <Image src={"/images/profile/user-1.jpg"} alt="Yash Mishra" fill className="object-cover" />
            </div>
          </div>

          {/* main content */}
          <div className="md:col-span-2 flex flex-col">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Yash Mishra</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Full‑stack web developer • React / Next.js / Node.js</p>

            <p className="text-gray-700 mt-4 leading-relaxed">
              I built this site myself to showcase projects, blog posts, and my resume. I focus on building
              accessible, performant, and maintainable web applications across the stack — from UI components
              to backend services and deployments.
            </p>

            <div className="mt-6">
              <h2 className="text-lg font-semibold">What I build</h2>
              <p className="text-gray-700 mt-2 text-sm md:text-base">
                Production-ready web apps: dashboards, landing pages, internal tools and prototypes. I prioritize
                component-driven design, accessibility, and responsive UX.
              </p>
            </div>

            <div className="mt-4">
              <h3 className="font-medium text-sm">Skills</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-gray-100 rounded-full text-xs md:text-sm text-gray-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <h3 className="font-medium">Selected projects</h3>
              <ul className="mt-2 space-y-2 text-sm md:text-base">
                {projects.map((p) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {p.name}
                    </a>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-gray-500 text-xs">Web app / Prototype</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-sm">Education</h4>
              <p className="text-gray-600 text-sm mt-2">B.Sc. / Computer Science — (details available on resume)</p>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-600">
                Want to collaborate or see more? Use the contact panel on the right — quick links and resume download.
              </p>
            </div>
          </div>

          {/* contact panel - side-wise on desktop, stacked on mobile */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24 bg-white/60 backdrop-blur-md rounded-xl p-6 shadow-md border border-gray-100">
              <h4 className="text-lg font-semibold">Contact & Links</h4>
              <p className="text-gray-600 text-sm mt-2">Prefer email or want to view my resume? Use the buttons below.</p>

              <div className="mt-4 space-y-3">
                <Button asChild className="w-full py-3">
                  <a href="mailto:yashm4720@gmail.com" className="w-full text-center">Email me</a>
                </Button>

                <Button asChild className="w-full py-3">
                  <a href="https://www.linkedin.com/in/yash-mishra-87b29725b" target="_blank" rel="noopener noreferrer" className="w-full text-center">
                    LinkedIn
                  </a>
                </Button>

                <Button asChild className="w-full py-3">
                  <a href="https://github.com/yash-mishra150" target="_blank" rel="noopener noreferrer" className="w-full text-center">
                    GitHub
                  </a>
                </Button>

                <Button asChild className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white">
                  <a href="/Resume.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-center">
                    View Resume
                  </a>
                </Button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Available for freelance & full-time roles. Open to collaborations.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
   );
 };
   
 export default page;