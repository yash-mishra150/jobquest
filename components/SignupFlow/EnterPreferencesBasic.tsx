'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '../ui/select';
import { useDispatch } from 'react-redux';
import { setField, setStep } from '@/redux/slices/signupFlowSlice';

type PreferencesBasicFormData = {
    phone: string;
    userType: string;
    preferredJobType: string;
    preferredWorkMode: string;
};

const EnterPreferencesBasic = () => {
    const dispatch = useDispatch();

    const { register, handleSubmit, setValue } = useForm<PreferencesBasicFormData>({
        defaultValues: {
            phone: '',
            userType: '',
            preferredJobType: '',
            preferredWorkMode: '',
        },
    });

    const onSubmit = (data: PreferencesBasicFormData) => {
        // Dispatch the values to Redux
        dispatch(setField(data));

        // Go to next step → assuming step 4 (Advanced Preferences)
        dispatch(setStep(3));
    };

    return (
        <div className="flex justify-center px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col justify-center w-full max-w-md mt-10"
            >
                <div className="text-center mb-6">
                    <p className="text-3xl font-semibold">Tell us about your preferences</p>
                    <p className="text-sm mt-3 text-gray-600">
                        We will use this information to show you the most relevant opportunities.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Phone */}
                    <div>
                        <p className="mb-1">Phone</p>
                        <Input
                            {...register('phone')}
                            placeholder="9876543210"
                            className="w-full border-black focus-visible:ring-[#7367F0] py-5 px-3 rounded-2xl"
                        />
                    </div>

                    {/* User Type */}
                    <div>
                        <p className="mb-1">User Type</p>
                        <Select
                            onValueChange={(value) => setValue('userType', value)}
                        >
                            <SelectTrigger className="w-full border-black focus-visible:ring-[#7367F0] py-5 px-3 rounded-2xl">
                                <SelectValue placeholder="Select User Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Professional">Professional</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Preferred Job Type */}
                    <div>
                        <p className="mb-1">Preferred Job Type</p>
                        <Select
                            onValueChange={(value) => setValue('preferredJobType', value)}
                        >
                            <SelectTrigger className="w-full border-black focus-visible:ring-[#7367F0] py-5 px-3 rounded-2xl">
                                <SelectValue placeholder="Select Job Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Internship">Internship</SelectItem>
                                <SelectItem value="Job">Job</SelectItem>
                                <SelectItem value="Both">Both</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Preferred Work Mode */}
                    <div>
                        <p className="mb-1">Preferred Work Mode</p>
                        <Select
                            onValueChange={(value) => setValue('preferredWorkMode', value)}
                        >
                            <SelectTrigger className="w-full border-black focus-visible:ring-[#7367F0] py-5 px-3 rounded-2xl">
                                <SelectValue placeholder="Select Work Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Onsite">Onsite</SelectItem>
                                <SelectItem value="Remote">Remote</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-[#7367F0] py-7 px-3 mt-8 disabled:bg-neutral-200 disabled:text-black rounded-2xl text-lg"
                >
                    Continue
                </Button>
            </form>
        </div>
    );
};

export default EnterPreferencesBasic;