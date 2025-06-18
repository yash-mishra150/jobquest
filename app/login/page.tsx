import BaseNavbar from '@/components/Navbars/BaseNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import * as React from 'react';

interface pageProps { }

const page = ({ }: pageProps) => {
  return (
    <div className="h-[100svh]"> {/* I fixed this: h-[100] was not correct */}
      <BaseNavbar text="Sign up for free" />
      <div className="flex flex-col justify-center items-center mt-10 space-y-3 px-4">
        <p className="text-center text-2xl font-semibold">Log In to JobQuest</p>

        {/* Google Button */}
        <Button
          className="
            border-neutral-300 
            rounded-2xl 
            py-7 
            px-6
            w-[80vw] max-w-[450px]
            flex justify-center items-center gap-3 
            text-lg font-semibold mt-3
          "
          variant="outline"
        >
          <Image
            alt="google"
            src={require('../../public/google.png')}
            height={25}
          />
          Sign in with Google
        </Button>

        {/* Another Google Button */}
        <Button
          className="
            border-neutral-300 
            rounded-2xl 
            py-7 
            px-6
            w-[80vw] max-w-[450px]
            flex justify-center items-center gap-3 
            text-lg font-semibold
          "
          variant="outline"
        >
          <Image
            alt="google"
            src={require('../../public/google.png')}
            height={25}
          />
          Sign in with Google
        </Button>

        <div className="flex items-center gap-3 w-[80vw] max-w-[450px]">
          <div className="h-[2px] flex-1 bg-neutral-300" />
          <div className="text-neutral-600 text-lg font-semibold">OR</div>
          <div className="h-[2px] flex-1 bg-neutral-300" />
        </div>

        <div className=''>
          <p>Username</p>
          <Input name='' placeholder='name@company.com' className='w-[80vw] max-w-[450px] border-black focus-visible:ring-[#7367F0] py-6.5 px-3 rounded-2xl mt-2' />
          <p className='mt-2'>Password</p>
          <Input name='' placeholder='ExPass@123' className='w-[80vw] max-w-[450px] border-black focus-visible:ring-[#7367F0] py-6.5 px-3 rounded-2xl mt-2' />
        </div>
        <Button className='w-[80vw] bg-[#7367F0] max-w-[450px] py-7 px-3 disabled:bg-neutral-200 disabled:text-black rounded-2xl mt-2 text-lg' 
        // disabled
        >Continue</Button>
      </div>
    </div>
  );
};

export default page;
