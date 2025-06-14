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
          alt="JobQuestLogo"
          src={require("../../public/logo.png")}
          height={40}
          width={40}
          className='h-8 w-8 md:h-10 md:w-10'
        />
        <h1 className='font-semibold text-xl md:text-2xl'>JobQuest</h1>
      </div>
      <Button
        className='
          bg-[#49a6b4] text-white poppins
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