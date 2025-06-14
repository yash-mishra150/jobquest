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

type PreferencesAdvancedFormData = {
    locationPreferences: string;
    skills: string;
    expectedSalaryRange: string;
    // resume: FileList; // Commented for now
};

const EnterPreferencesAdvanced = () => {
    const dispatch = useDispatch();

    const { register, handleSubmit, setValue } = useForm<PreferencesAdvancedFormData>({
        defaultValues: {
            expectedSalaryRange: '',
        },
    });

    const onSubmit = (data: PreferencesAdvancedFormData) => {
        console.log('Advanced Preferences Data:', data);

        // Convert comma-separated strings to arrays
        const locationPreferencesArray = data.locationPreferences
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item);

        const skillsArray = data.skills
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item);

        // Dispatch to Redux
        dispatch(setField({
            locationPreferences: locationPreferencesArray,
            skills: skillsArray,
            expectedSalaryRange: data.expectedSalaryRange,
        }));

        // Go to final step (assuming step 5)
        dispatch(setStep(4));
    };

    return (
        <div className="flex justify-center px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col justify-center w-full max-w-md mt-10"
            >
                <div className="text-center mb-6">
                    <p className="text-3xl font-semibold">Enhance your profile</p>
                    <p className="text-sm mt-3 text-gray-600">
                        Add your skills, locations, and preferences to improve your job matches.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Location Preferences */}
                    <div>
                        <p className="mb-1">Location Preferences (comma separated)</p>
                        <Input
                            {...register('locationPreferences')}
                            placeholder="Bangalore, Remote"
                            className="w-full border-black focus-visible:ring-[#49a6b4] py-5 px-3 rounded-2xl"
                        />
                    </div>

                    {/* Skills */}
                    <div>
                        <p className="mb-1">Skills (comma separated)</p>
                        <Input
                            {...register('skills')}
                            placeholder="JavaScript, React, MongoDB"
                            className="w-full border-black focus-visible:ring-[#49a6b4] py-5 px-3 rounded-2xl"
                        />
                    </div>

                    {/* Expected Salary Range */}
                    <div>
                        <p className="mb-1">Expected Salary Range</p>
                        <Select
                            onValueChange={(value) => setValue('expectedSalaryRange', value)}
                        >
                            <SelectTrigger className="w-full border-black focus-visible:ring-[#49a6b4] py-5 px-3 rounded-2xl">
                                <SelectValue placeholder="Select Salary Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0-3 LPA">0-3 LPA</SelectItem>
                                <SelectItem value="3-6 LPA">3-6 LPA</SelectItem>
                                <SelectItem value="6-10 LPA">6-10 LPA</SelectItem>
                                <SelectItem value="10-15 LPA">10-15 LPA</SelectItem>
                                <SelectItem value="15+ LPA">15+ LPA</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Resume (commented out for now) */}
                    {/*
                    <div>
                        <p className="mb-1">Upload Resume</p>
                        <Input
                            type="file"
                            {...register('resume')}
                            className="w-full border-black focus-visible:ring-[#49a6b4] py-3 px-3 rounded-2xl"
                        />
                    </div>
                    */}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-[#49a6b4] py-7 px-3 mt-8 disabled:bg-neutral-200 disabled:text-black rounded-2xl text-lg"
                >
                    Continue
                </Button>
            </form>
        </div>
    );
};

export default EnterPreferencesAdvanced;