"use client";

import * as React from 'react';
import { Helix } from 'ldrs/react';
import 'ldrs/react/Helix.css';

interface InitialLoadingProps {}

const InitialLoading = ({}: InitialLoadingProps) => {
    const [dots, setDots] = React.useState('');

    React.useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length < 3 ? prev + '.' : ''));
        }, 500); // change every 500ms

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-white space-y-4">
            {/* <Image src="/logo.png" alt="Logo" className="w-16 h-16" /> */}
            <Helix size="100" speed="2.5" color="black" />
            <p className="text-lg text-gray-500">Loading, please wait{dots}</p>
        </div>
    );
};

export default InitialLoading;
