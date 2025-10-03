'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout, login } from '@/redux/features/AuthSlice';
import { checkValidity } from '@/services/api';
import InitialLoading from './InitialLoading';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface InitialValidityCheckProps {
    children: React.ReactNode;
}

const InitialValidityCheck: React.FC<InitialValidityCheckProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [validationComplete, setValidationComplete] = useState(false);
    const hasValidated = useRef(false);
    const router = useRouter();
    const dispatch = useDispatch();

    const { userRole, isLoggedIn } = useSelector((state: RootState) => state.auth);

    // Only run validation once on initial load
    useEffect(() => {
        // Skip if already validated during this session
        if (hasValidated.current) {
            setLoading(false);
            setValidationComplete(true);
            return;
        }

        const validateAPI = async () => {
            try {
                const resp = await checkValidity({ detailed: true });
                
                // Type guard to ensure we have detailed response
                if (typeof resp === 'boolean' || !resp.valid) {
                    dispatch(logout());
                } else if (resp.valid && resp.role) {
                    // If validation is successful, dispatch login with role
                    dispatch(login({ userRole: resp.role, userName: resp.name || '', userType: resp.userType || '' }));
                }
                
                hasValidated.current = true;
                setValidationComplete(true);
                setLoading(false);

            } catch (error) {
                console.error("API validation error:", error);
                dispatch(logout());
                hasValidated.current = true;
                setValidationComplete(true);
                setLoading(false);
            }
        };        validateAPI();
    }, []);
    useEffect(() => {
        if (!validationComplete) return;

        if (isLoggedIn && userRole) {
            const currentPath = window.location.pathname;
            
            // Only redirect if user is on login page or root
            if (currentPath === '/login' || currentPath === '/') {
                if (userRole === 'ROLE_CANDIDATE') {
                    router.push('/');
                } else if (userRole === 'ROLE_EMPLOYER') {
                    router.push('/employer');
                }
            }
        } else if (!isLoggedIn && validationComplete) {
            const currentPath = window.location.pathname;
            
            // Only redirect to login if user is trying to access protected routes
            if (currentPath.startsWith('/employer') || currentPath.startsWith('/candidate')) {
                router.push('/login');
            }
        }
    }, [isLoggedIn, userRole, router, validationComplete]);

    if (loading) {
        return <InitialLoading />;
    }

    return <>{children}</>;
};

export default InitialValidityCheck;