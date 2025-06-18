"use client";

import Image from 'next/image';
import * as React from 'react';
import { Button } from '../ui/button';

interface BaseNavbarProps {
  text: string;
}

const BaseNavbar = ({ text }: BaseNavbarProps) => {
  return (
    <div className='p-4 px-4 md:px-10 flex w-full justify-between items-center'>
      <div className='flex gap-2 items-center'>
        <Image
          alt="JobQuest Logo"
          src="/logoDark.png"
          width={400}
          height={400}
          className="h-10 w-auto max-w-[400px] object-contain"
        />
      </div>
      <Button
        className='
          bg-[#7367F0] text-white poppins
          truncate overflow-hidden whitespace-nowrap
           md:max-w-none
        '
      >
        {text}
      </Button>
    </div>
  );
};

export default BaseNavbar;