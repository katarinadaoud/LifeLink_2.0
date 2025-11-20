import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface ProfileGuardProps {
    children: React.ReactNode;
}

const ProfileGuard: React.FC<ProfileGuardProps> = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkProfile = async () => {
            if (!user) {
                setIsChecking(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsChecking(false);
                    return;
                }

                // Try to create profile, if it fails, user might need profile setup
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Auth/create-profile`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    // Profile created or already exists
                    setHasProfile(true);
                } else {
                    const errorText = await response.text();
                    
                    // Check if error indicates profile already exists
                    if (errorText.includes('already exists') || response.status === 400) {
                        setHasProfile(true);
                    } else {
                        // User needs to complete profile
                        setHasProfile(false);
                        navigate('/profile-setup');
                    }
                }
            } catch (error) {
                console.error('Error checking profile:', error);
                // On error, assume profile exists to avoid redirect loop
                setHasProfile(true);
            } finally {
                setIsChecking(false);
            }
        };

        if (user) {
            checkProfile();
        } else {
            setIsChecking(false);
        }
    }, [user, navigate]);

    if (isChecking) {
        return <div className="d-flex justify-content-center mt-5">
            <div>Checking profile...</div>
        </div>;
    }

    if (!user) {
        return <>{children}</>;
    }

    if (hasProfile === false) {
        return null; // Will redirect to profile setup
    }

    return <>{children}</>;
};

export default ProfileGuard;