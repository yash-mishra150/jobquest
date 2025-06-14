'use client';

import BaseNavbar from '@/components/Navbars/BaseNavbar';
import EmailEnter from '@/components/SignupFlow/EmailEnter';
import SignUpMain from '@/components/SignUpMain';
import * as React from 'react';

interface pageProps {}

const Page = ({}: pageProps) => {
  const [choice, setChoice] = React.useState<'email' | 'step'>('email');

  const renderStep = () => {
    switch (choice) {
      case 'email':
        return <EmailEnter onContinue={() => setChoice('step')} />;
      case 'step':
        return <SignUpMain />;
      default:
        return null;
    }
  };

  return (
    <div>
      <BaseNavbar text="Log In" />
      <br />
      {renderStep()}
    </div>
  );
};

export default Page;
