import type { LoginDto, RegisterDto } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (credentials: LoginDto): Promise<{ token: string }> => {
    const response = await fetch(`${API_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const responseText = await response.text();
        try {
            const errorData = JSON.parse(responseText);
            throw new Error(errorData.message || 'Login failed');
        } catch (jsonError) {
            throw new Error(responseText || `Login failed with status ${response.status}`);
        }
    }
    console.log(response);
    return response.json();
};

export const register = async (userData: RegisterDto): Promise<any> => {
    const response = await fetch(`${API_URL}/api/Auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const responseText = await response.text();
        try {
            const errorData = JSON.parse(responseText);
            // The backend sends an array of errors, let's format them.
            const errorMessages = errorData.map((err: { description: string }) => err.description).join(', ');
            throw new Error(errorMessages || 'Registration failed');
        } catch (jsonError) {
            // If response is not JSON, use raw text
            throw new Error(responseText || `Registration failed with status ${response.status}`);
        }
    }

    return response.json();
};

// Logout is handled client-side by clearing the token.