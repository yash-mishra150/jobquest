'use client';

import BaseNavbar from '@/components/Navbars/BaseNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import * as React from 'react';
import { useState } from 'react';
import { login } from '@/services/api/authService';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '@/redux/features/AuthSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';

const Login = () => {
  const [userType, setUserType] = useState<'Candidate' | 'Employer'>('Candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  const { userRole, isLoggedIn } = useSelector((state: RootState) => state.auth);
  // Theme colors based on user type
  const themeColor = userType === 'Candidate' ? '#7367F0' : '#6c3ebf';
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (isLoggedIn && userRole) {
      // Redirect based on user role
      if (userRole === 'ROLE_CANDIDATE') {
        router.push('/'); 
      } else if (userRole === 'ROLE_EMPLOYER') {
        router.push('/employer');
      } else {
        router.push('/');
      }
    }
  }, [isLoggedIn, userRole, router]);

  const handleSubmit = async () => {
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      const credentials = {
        email,
        password,
        userType
      };

      const response = await login(credentials);

      if (response.success) {
        // Store auth information in Redux
        dispatch(loginAction({
          userRole: response.role || userType,
          userName: response.name,
          userType: userType
        }));
        // Redirect based on user type
        router.push(userType === 'Candidate' ? '/' : '/employer');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message[0] || 
        err.response?.data?.message || 
        err.message || 
        'An unexpected error occurred during login';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100svh]">
      <BaseNavbar text="Sign up for free" />
      <div className="flex flex-col justify-center items-center mt-10 space-y-3 px-4">
        <p className="text-center text-2xl font-semibold">Log In to JobQuest</p>

        {/* Toggle for Candidate/Employer */}
        <div className="flex p-1 bg-gray-100 rounded-full w-[80vw] max-w-[350px] mt-2">
          <button
            onClick={() => setUserType('Candidate')}
            className={`flex-1 py-2 rounded-full text-center transition-all duration-300 ${userType === 'Candidate'
                ? 'bg-[#7367F0] text-white font-medium'
                : 'text-gray-600'
              }`}
          >
            Candidate
          </button>
          <button
            onClick={() => setUserType('Employer')}
            className={`flex-1 py-2 rounded-full text-center transition-all duration-300 ${userType === 'Employer'
                ? 'bg-[#6c3ebf] text-white font-medium'
                : 'text-gray-600'
              }`}
          >
            Employer
          </button>
        </div>

        {/* Google Button */}
        <Button
          className={`
            border-neutral-300 
            rounded-2xl 
            py-7 
            px-6
            w-[80vw] max-w-[450px]
            flex justify-center items-center gap-3 
            text-lg font-semibold mt-3
            hover:border-[${themeColor}]
            transition-all
          `}
          variant="outline"
        >
          <Image
            alt="google"
            src="/google.png"
            width={25}
            height={25}
          />
          Sign in with Google
        </Button>

        <div className="flex items-center gap-3 w-[80vw] max-w-[450px] my-2">
          <div className="h-[2px] flex-1 bg-neutral-300" />
          <div className="text-neutral-600 text-sm font-medium">OR</div>
          <div className="h-[2px] flex-1 bg-neutral-300" />
        </div>

        <div className='w-full max-w-[450px]'>
          <p className="text-sm font-medium mb-1 text-gray-700">Email</p>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='name@company.com'
            className='w-full border-gray-300 focus-visible:ring-[#7367F0] py-6 px-3 rounded-xl'
          />

          <div className="flex justify-between items-center mt-3">
            <p className='text-sm font-medium text-gray-700'>Password</p>
            <a href="#" className={`text-xs font-medium text-[${themeColor}]`}>Forgot Password?</a>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='••••••••'
            className='w-full border-gray-300 focus-visible:ring-[#7367F0] py-6 px-3 rounded-xl mt-1'
          />

          {error && (
            <div className="mt-2 text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          className={`w-[80vw] max-w-[450px] py-6 px-3 rounded-xl mt-4 text-lg font-medium transition-all
            ${userType === 'Candidate'
              ? 'bg-[#7367F0] hover:bg-[#5e52d6]'
              : 'bg-[#6c3ebf] hover:bg-[#5931a9]'}
            disabled:bg-neutral-200 disabled:text-gray-500 disabled:cursor-not-allowed
          `}
          disabled={!email || !password || loading}
        >
          {loading ? 'Logging in...' : userType === 'Candidate' ? 'Login as Candidate' : 'Login as Employer'}
        </Button>

        <p className="text-sm text-gray-600 mt-4">
          Don&apos;t have an account?
          <Link href="/signup" className={`text-[${themeColor}] font-medium ml-1`}>Create one now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
