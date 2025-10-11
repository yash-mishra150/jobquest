import Image from "next/image";
import * as React from "react";

interface pageProps {}

const sampleBlogs = [
	{
		id: 1,
		image: "/officeBG.jpg",
		title: "How to Prepare for Technical Interviews in 2025",
		description:
			"A concise guide to help you focus on system design, problem solving, and behavioral rounds.",
		author: "Asha Verma",
		date: "2025-10-01",
	},
	{
		id: 2,
		image: "/officeBG.jpg",
		title: "Resume Tips That Actually Get Recruiter Attention",
		description:
			"Actionable resume improvements that increase your chances of getting an interview.",
		author: "Ravi Kumar",
		date: "2025-09-20",
	},
	{
		id: 3,
		image: "/officeBG.jpg",
		title: "Top 10 Remote-Friendly Companies Hiring Now",
		description:
			"A curated list of companies that offer solid remote roles and good benefits.",
		author: "Meera Joshi",
		date: "2025-08-30",
	},
	{
		id: 3,
		image: "/officeBG.jpg",
		title: "Top 10 Remote-Friendly Companies Hiring Now",
		description:
			"A curated list of companies that offer solid remote roles and good benefits.",
		author: "Meera Joshi",
		date: "2025-08-30",
	},
	{
		id: 3,
		image: "/images/backgrounds/products/product-3.jpg",
		title: "Top 10 Remote-Friendly Companies Hiring Now",
		description:
			"A curated list of companies that offer solid remote roles and good benefits.",
		author: "Meera Joshi",
		date: "2025-08-30",
	},
	{
		id: 3,
		image: "/images/backgrounds/products/product-3.jpg",
		title: "Top 10 Remote-Friendly Companies Hiring Now",
		description:
			"A curated list of companies that offer solid remote roles and good benefits.",
		author: "Meera Joshi",
		date: "2025-08-30",
	},
	{
		id: 3,
		image: "/images/backgrounds/products/product-3.jpg",
		title: "Top 10 Remote-Friendly Companies Hiring Now",
		description:
			"A curated list of companies that offer solid remote roles and good benefits.",
		author: "Meera Joshi",
		date: "2025-08-30",
	},
	{
		id: 3,
		image: "/officeBG.jpg",
		title: "Top 10 Remote-Friendly Companies Hiring Now",
		description:
			"A curated list of companies that offer solid remote roles and good benefits.",
		author: "Meera Joshi",
		date: "2025-08-30",
	},
];

const page = ({}: pageProps) => {
	return (
		<div className="flex justify-center items-center">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 w-full">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{sampleBlogs.map((b, index) => (
						<div
							key={`${b.id ?? "item"}-${index}`}
							className="flex flex-col h-full bg-transparent"
						>
							<div className="relative w-full h-64 sm:h-56 md:h-56 lg:h-64 rounded-2xl overflow-hidden">
								<Image
									src={b.image || "/officeBG.jpg"}
									alt={b.title}
									fill
									className="object-cover"
								/>
							</div>

							<div className="p-3 sm:p-4">
								<h2 className="font-semibold text-lg sm:text-xl">
									{b.title}
								</h2>
								<p className="text-sm text-gray-600 poppins mt-2">
									{b.description}
								</p>
								<div className="flex gap-3 items-center mt-4">
									<Image
										className="object-cover rounded-full"
										src={"/images/profile/user-1.jpg"}
										alt={b.author}
										width={32}
										height={32}
									/>
									<h2 className="font-semibold text-sm">
										{b.author}
									</h2>
									<span className="text-gray-400">•</span>
									<span className="text-gray-400 text-sm">
										{new Date(b.date).toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
										})}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default page;
