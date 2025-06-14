'use client';

import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

const steps = ['Verify', 'Name', 'Basic Pref', 'Adv Pref'];

const Stepper = () => {
  const currentStep = useSelector((state: RootState) => state.signupFlow.currentStep);

  return (
    <div className="flex justify-center mt-6 mb-4 space-x-6">
      {steps.map((label, index) => {
        const isActive = index <= currentStep;
        return (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2
                ${isActive ? 'bg-[#49a6b4] text-white border-[#49a6b4]' : 'bg-white text-gray-500 border-gray-300'}
              `}
            >
              {index + 1}
            </div>
            <div className="text-xs mt-2 text-center w-16">{label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;