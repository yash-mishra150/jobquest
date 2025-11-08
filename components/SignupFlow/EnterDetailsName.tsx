'use client';

import * as React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useDispatch } from 'react-redux';
import { setField, setStep } from '@/redux/slices/signupFlowSlice';



const EnterDetailsName = ({}: Props) => {
    const dispatch = useDispatch();

    const [email, setEmail] = React.useState('');
    const [name, setName] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const handleContinue = () => {
        if (!email || !name || !password || password !== confirmPassword) {
            // You can also add toast message or error state here
            return;
        }

        // Dispatch values to Redux store:
        dispatch(setField({ email, name, password }));


        // Move to next step:
        dispatch(setStep(2)); // Assuming step 3 is EnterPreferencesBasic
    };

    return (
        <div className="flex justify-center px-4">
            <div className="flex flex-col justify-center w-full max-w-md mt-10">
                <div className="text-center mb-6">
                    <p className="text-3xl font-semibold">What is your name?</p>
                    <p className="text-sm mt-3 text-gray-600">
                        This name will show on your applications and profile.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <p className="mb-1">Email</p>
                        <Input
                            name="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-black focus-visible:ring-[#7367F0] py-5 px-3 rounded-2xl"
                        />
                    </div>

                    <div>
                        <p className="mb-1">Name</p>
                        <Input
                            name="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border-black focus-visible:ring-[#7367F0] py-5 px-3 rounded-2xl"
                        />
                    </div>

                    <div>
                        <p className="mb-1">Password</p>
                        <Input
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-black focus-visible:ring-[#7367F0] py-5 px-3 rounded-2xl"
                        />
                    </div>

                    <div>
                        <p className="mb-1">Confirm Password</p>
                        <Input
                            name="confirm-password"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border-black focus-visible:ring-[#7367F0] py-5 px-3 rounded-2xl"
                        />
                    </div>
                </div>

                <Button
                    onClick={handleContinue}
                    disabled={
                        !email || !name || !password || password !== confirmPassword
                    }
                    className="w-full bg-[#7367F0] py-7 px-3 mt-8 disabled:bg-neutral-200 disabled:text-black rounded-2xl text-lg"
                >
                    Continue
                </Button>

                <p className="text-sm text-center text-gray-600 mt-6 mb-10 px-2 leading-relaxed">
                    By signing up, you acknowledge that you have read and agree to our{' '}
                    <a href="/terms" className="text-[#7367F0] underline">
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-[#7367F0] underline">
                        Privacy Policy
                    </a>.
                </p>
            </div>
        </div>
    );
};

export default EnterDetailsName;
