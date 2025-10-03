import * as React from 'react';
import { Eye, Check, X, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Candidate {
  id: number;
  name: string;
  role: string;
  location: string;
  avatar: string; // image URL or import
  bgColor: string; // Tailwind bg color
}

const candidates: Candidate[] = [
  {
    id: 1,
    name: 'Avy',
    role: 'React Developer',
    location: 'Chicago, US',
    avatar: '/images/profile/user-1.jpg',
    bgColor: 'bg-green-400',
  },
  {
    id: 2,
    name: 'Mark',
    role: 'React Developer',
    location: 'Chicago, US',
    avatar: '/images/profile/user-1.jpg',
    bgColor: 'bg-blue-400',
  },
  {
    id: 3,
    name: 'Avy',
    role: 'React Developer',
    location: 'Chicago, US',
    avatar: '/images/profile/user-1.jpg',
    bgColor: 'bg-red-400',
  },
  {
    id: 4,
    name: 'Mark',
    role: 'React Developer',
    location: 'Chicago, US',
    avatar: '/images/profile/user-1.jpg',
    bgColor: 'bg-blue-400',
  },
  {
    id: 5,
    name: 'Avy',
    role: 'React Developer',
    location: 'Chicago, US',
    avatar: '/images/profile/user-1.jpg',
    bgColor: 'bg-orange-300',
  },
  {
    id: 6,
    name: 'Avy',
    role: 'React Developer',
    location: 'Chicago, US',
    avatar: '/images/profile/user-1.jpg',
    bgColor: 'bg-red-400',
  },
  {
    id: 7,
    name: 'Mark',
    role: 'React Developer',
    location: 'Chicago, US',
    avatar: '/images/profile/user-1.jpg',
    bgColor: 'bg-blue-400',
  },
  {
    id: 8,
    name: 'Avy',
    role: 'React Developer',
    location: 'Chicago, US',
    avatar: '/images/profile/user-1.jpg',
    bgColor: 'bg-orange-300',
  },
];

const groupByRole = (candidates: Candidate[]) => {
  return candidates.reduce((acc: { [role: string]: Candidate[] }, candidate) => {
    if (!acc[candidate.role]) acc[candidate.role] = [];
    acc[candidate.role].push(candidate);
    return acc;
  }, {});
};

const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
  <div className="flex items-center justify-between bg-white rounded-xl p-4 mb-4 shadow-sm">
    <div className="flex items-center">
      <div className={`rounded-xl flex items-center justify-center mr-4 ${candidate.bgColor} w-14 h-14`}>
        <Image
          src={candidate.avatar || 'https://placehold.co/64x64'}
          alt={candidate.name}
          width={48}
          height={48}
          className="w-12 h-12 rounded-xl object-cover"
        />
      </div>
      <div>
        <div className="font-medium text-base">{candidate.name}</div>
        <div className="text-gray-500 text-xs">{candidate.location}</div>
      </div>
    </div>
    <div className="flex space-x-2">
      <button className="p-1.5 rounded-full hover:bg-purple-100 text-purple-400">
        <Eye size={16} />
      </button>
      <button className="p-1.5 rounded-full hover:bg-purple-100 text-purple-400">
        <Check size={16} />
      </button>
      <button className="p-1.5 rounded-full hover:bg-purple-100 text-purple-400">
        <X size={16} />
      </button>
      <button className="p-1.5 rounded-full hover:bg-purple-100 text-purple-400">
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

const page = () => {
  const grouped = groupByRole(candidates);
  return (
    <div className="w-full p-8 pt-6 bg-gray-100">
      <h1 className="text-2xl font-semibold mb-6">Candidates</h1>
      <div className="space-y-10">
        {Object.keys(grouped).map(role => (
          <div key={role}>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">{role}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              {grouped[role].map(candidate => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;