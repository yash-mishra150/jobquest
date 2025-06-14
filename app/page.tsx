"use client";

import Footer from '@/components/Footer';
import InitialLoading from '@/components/InitialLoading';
import Navbar from '@/components/Navbars/Navbar';
import * as React from 'react';

interface pageProps {
}

const Home = ({ }: pageProps) => {
  return (
    <div>
      {/* <InitialLoading /> */}
      <Navbar />
      {/* <Footer/> */}
    </div>
  );
};

export default Home;