'use client';

import React from 'react';
import EmailVerify from '@/components/SignupFlow/EmailVerify';
import EnterDetailsName from '@/components/SignupFlow/EnterDetailsName';
import EnterPreferencesAdvanced from '@/components/SignupFlow/EnterPreferencesAdvance';
import EnterPreferencesBasic from '@/components/SignupFlow/EnterPreferencesBasic';
import Stepper from '@/components/Stepper';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';



const SignUpMain: React.FC<Props> = () => {
  const currentStep = useSelector((state: RootState) => state.signupFlow.currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <EmailVerify />;
      case 1:
        return <EnterDetailsName />;
      case 2:
        return <EnterPreferencesBasic />;
      case 3:
        return <EnterPreferencesAdvanced />;
      default:
        return <EmailVerify />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* <BaseNavbar text="Log In" /> */}
      
      <main className="flex flex-col flex-grow items-center px-4">
        <Stepper />
        
        <div className="w-full max-w-md">
          {renderStep()}
        </div>
      </main>
    </div>
  );
};

export default SignUpMain;
