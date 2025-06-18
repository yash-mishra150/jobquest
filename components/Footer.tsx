import * as React from 'react';
import Image from 'next/image';
import { useState } from 'react';
import { Twitter, Facebook, Instagram, Github } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface FooterProps { }

const Footer = ({ }: FooterProps) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle newsletter subscription logic here
        setEmail('');
    };

    const socialLinks = [
        { name: 'Twitter', Icon: Twitter, url: 'https://twitter.com' },
        { name: 'Facebook', Icon: Facebook, url: 'https://facebook.com' },
        { name: 'Instagram', Icon: Instagram, url: 'https://instagram.com' },
        { name: 'GitHub', Icon: Github, url: 'https://github.com' },
    ];

    const companyLinks = [
        { name: 'About Us', url: '/about' },
        { name: 'Our Mission', url: '/mission' },
        { name: 'Team', url: '/team' },
        { name: 'Careers', url: '/careers' },
    ];

    const helpLinks = [
        { name: 'Support Center', url: '/support' },
        { name: 'FAQs', url: '/faqs' },
        { name: 'Terms of Service', url: '/terms' },
        { name: 'Privacy Policy', url: '/privacy' },
    ];

    const portalLinks = [
        { name: 'Search Jobs', url: '/jobs' },
        { name: 'Find Internships', url: '/internships' },
        { name: 'Post a Job', url: '/post-job' },
        { name: 'Career Resources', url: '/resources' },
    ];

    return (
        <footer className="bg-white">
            <hr className="w-full border-t border-neutral-100" />
            <div className="px-4 py-12 sm:px-6 lg:px-20">
                <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-8 lg:flex-row">
                    <div className="max-w-xl text-center lg:text-left">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                            Explore Jobs & Internships
                        </h1>
                        <p className="mt-4 text-sm text-gray-600 sm:text-base lg:text-left">
                            Discover curated full-time jobs and internships tailored to your career goals with JobQuest.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                        <Button
                            className="flex h-12 w-48 items-center justify-center gap-2 bg-[#7367F0] text-white transition-colors duration-300"
                            aria-label="Download from Play Store"
                        >
                            <Image
                                alt="Google Play Store"
                                src="/google-play.svg"
                                width={20}
                                height={20}
                                className="h-5 w-5"
                            />
                            Play Store
                        </Button>
                        <Button
                            className="flex h-12 w-48 items-center justify-center gap-2 bg-[#7367F0] text-white transition-colors duration-300"
                            aria-label="Download from App Store"
                        >
                            <Image
                                alt="Apple App Store"
                                src="/apple.svg"
                                width={20}
                                height={20}
                                className="h-5 w-5"
                            />
                            App Store
                        </Button>
                    </div>
                </div>
            </div>
            <hr className="w-full border-t border-neutral-100" />

            <section className="bg-gray-50 py-10 sm:py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-6">
                        <div className="col-span-1 sm:col-span-2 lg:col-span-2 lg:pr-8">
                            <div className="flex items-center gap-3">
                                <Image
                                    alt="JobQuest Logo"
                                    src="/logo.png"
                                    width={40}
                                    height={40}
                                    className="h-10 w-auto max-w-[40px] object-contain"
                                />
                                <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">JobQuest</h2>
                            </div>
                            <p className="mt-6 text-sm text-gray-600 leading-relaxed sm:text-base">
                                Your one-stop platform for finding top-tier jobs and internships to kickstart or advance your career.
                            </p>
                            <ul className="mt-8 flex items-center gap-3" role="list" aria-label="Social media links">
                                {socialLinks.map(({ name, Icon, url }) => (
                                    <li key={name}>
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white transition-colors duration-200 hover:bg-jobquest-blue focus:bg-jobquest-blue"
                                            aria-label={name}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-span-1 sm:text-start text-center">
                            <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Company</h3>
                            <ul className="mt-6 space-y-4" role="list">
                                {companyLinks.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.url}
                                            className="text-sm text-gray-900 transition-colors duration-200 hover:text-jobquest-blue focus:text-jobquest-blue sm:text-base"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-span-1 sm:text-start text-center">
                            <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Help</h3>
                            <ul className="mt-6 space-y-4" role="list">
                                {helpLinks.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.url}
                                            className="text-sm text-gray-900 transition-colors duration-200 hover:text-jobquest-blue focus:text-jobquest-blue sm:text-base"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-span-1 sm:text-start text-center">
                            <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Explore</h3>
                            <ul className="mt-6 space-y-4" role="list">
                                {portalLinks.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.url}
                                            className="text-sm text-gray-900 transition-colors duration-200 hover:text-jobquest-blue focus:text-jobquest-blue sm:text-base"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-span-1 sm:col-span-2 lg:col-span-2 lg:pl-8">
                            <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Stay Updated</h3>
                            <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                Subscribe for the latest job and internship opportunities.
                            </p>
                            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 sm:flex-row" aria-label="Newsletter subscription">
                                <div className="flex">
                                    <Input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="h-12 w-48"
                                        required
                                        aria-required="true"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="rounded-md bg-[#7367F0] w-48  h-12 text-white font-semibold transition-colors duration-200 hover:bg-jobquest-blue-dark sm:py-2"
                                >
                                    Subscribe
                                </Button>
                            </form>
                        </div>
                    </div>

                    <hr className="my-10 border-gray-200" />
                    <p className="text-center text-sm text-gray-600">
                        © {new Date().getFullYear()} JobQuest. All rights reserved.
                    </p>
                </div>
            </section>
        </footer>
    );
};

export default Footer;