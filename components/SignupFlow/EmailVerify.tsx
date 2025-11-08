'use client';

import * as React from 'react';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../ui/input-otp';
import { Button } from '../ui/button';
import { useDispatch } from 'react-redux';
import { setStep } from '@/redux/slices/signupFlowSlice';



const EmailVerify = () => {
    const dispatch = useDispatch();

    const [otpValue, setOtpValue] = React.useState('');

    const handleContinue = () => {
        if (otpValue.length === 6) {
            // Here, you could also dispatch OTP value to Redux if needed:
            // dispatch(setField({ otp: otpValue })); --> if you want to store OTP

            // Move to next step
            dispatch(setStep(1)); // Assuming step 2 is EnterDetailsName
        }
    };

    return (
        <div className="w-full mt-10">
            <div className="text-center">
                <p className="text-2xl sm:text-3xl font-semibold">Kickstart your career</p>
                <p className="text-2xl sm:text-3xl font-semibold">Apply in seconds.</p>
            </div>
            <div className="flex justify-center px-4">
                <div className="w-full max-w-md rounded-2xl p-8 flex flex-col items-center gap-6">
                    <p className="text-sm text-gray-600 text-center">
                        Please enter the 6-digit code we sent to your ya*******@gmail.com
                    </p>
                    <InputOTP
                        maxLength={6}
                        value={otpValue}
                        onChange={(value) => setOtpValue(value)}
                    >
                        <InputOTPGroup className="flex gap-2 sm:gap-4">
                            {[...Array(3)].map((_, index) => (
                                <InputOTPSlot
                                    key={index}
                                    index={index}
                                    className="
                                    w-9 h-9 sm:w-12 sm:h-12
                                    text-lg sm:text-xl
                                    text-center
                                    rounded-lg
                                    border-2 border-gray-300
                                    focus:border-[#7367F0]
                                    focus-visible:ring-2 focus-visible:ring-[#7367F0]
                                    transition-all duration-200
                                    shadow
                                "
                                />
                            ))}
                            <InputOTPSeparator />
                            {[...Array(3)].map((_, index) => (
                                <InputOTPSlot
                                    key={index + 3}
                                    index={index + 3}
                                    className="
                                    w-9 h-9 sm:w-12 sm:h-12
                                    text-lg sm:text-xl
                                    text-center
                                    rounded-lg
                                    border-2 border-gray-300
                                    focus:border-[#7367F0]
                                    focus-visible:ring-2 focus-visible:ring-[#7367F0]
                                    transition-all duration-200
                                    shadow
                                "
                                />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>

                    <Button
                        variant="link"
                        className="text-sm text-[#7367F0] -mt-2 self-end"
                    >
                        Resend OTP
                    </Button>

                    <Button
                        onClick={handleContinue}
                        className="w-[80vw] bg-[#7367F0] max-w-[450px] py-6 sm:py-7 px-3 disabled:bg-neutral-200 disabled:text-black rounded-2xl mt-2 text-base sm:text-lg"
                        disabled={otpValue.length < 6}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerify;
