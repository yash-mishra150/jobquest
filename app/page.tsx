"use client";

import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import InitialLoading from '@/components/InitialLoading';
import * as React from 'react';

interface pageProps {
}

const Home = ({ }: pageProps) => {
  return (
    <div>
      {/* <InitialLoading /> */}
      <HeroSection/>
      {/* <Footer/> */}
    </div>
  );
};

export default Home;