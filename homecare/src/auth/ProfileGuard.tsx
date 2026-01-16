import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { API_BASE_URL } from '../shared/apiBase';

interface ProfileGuardProps { // Props for ProfileGuard component
    children: React.ReactNode;
}
// Component to ensure user has a profile before accessing certain routes
const ProfileGuard: React.FC<ProfileGuardProps> = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    // Check if user has a profile on mount or when user changes
    useEffect(() => {
        const checkProfile = async () => { // Function to check if profile exists
            if (!user) {
                setIsChecking(false);
                return;
            }

            try { // Get token from local storage
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsChecking(false);
                    return;
                }

                // Check whether profile exists by calling the correct GET endpoint
                // Try both Patient and Employee endpoints based on the user's roles
                let profileExists = false;
                // Determine which endpoint to check: try Patient then Employee
                const userId = user.sub || user.nameid;
                if (userId) {
                    const patientResp = await fetch(`${API_BASE_URL}/api/patient/user/${userId}`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (patientResp.ok) profileExists = true;
                    const employeeResp = await fetch(`${API_BASE_URL}/api/employee/user/${userId}`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (employeeResp.ok) profileExists = true;
                }
                if (profileExists) {
                    setHasProfile(true);
                } else {
                    setHasProfile(false);
                    navigate('/profile-setup');
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

    if (isChecking) { // Show loading state while checking profile
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