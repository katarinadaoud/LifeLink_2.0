import type { LoginDto, RegisterDto } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL; //Base URL from environment variables

//Send login request and return JWT token
export const login = async (credentials: LoginDto): Promise<{ token: string }> => {
    const response = await fetch(`${API_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    //Handle backend errors
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

//Register new user
export const register = async (userData: RegisterDto): Promise<any> => {
    const response = await fetch(`${API_URL}/api/Auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    //Format and handle backend validation errors
    if (!response.ok) {
        const responseText = await response.text();
        try {
            const errorData = JSON.parse(responseText);
            const errorMessages = errorData.map((err: { description: string }) => err.description).join(', ');
            throw new Error(errorMessages || 'Registration failed');
        } catch (jsonError) {
            throw new Error(responseText || `Registration failed with status ${response.status}`);
        }
    }

    return response.json();
};

//Create user profile after registration
export const createProfile = async (): Promise<{ message: string }> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/api/Auth/create-profile`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    //Handle profile creation errors
    if (!response.ok) {
        const responseText = await response.text();
        try {
            const errorData = JSON.parse(responseText);
            const errorMessages = errorData.map((err: { description: string }) => err.description).join(', ');
            throw new Error(errorMessages || 'Profile creation failed');
        } catch (jsonError) {
            throw new Error(responseText || `Profile creation failed with status ${response.status}`);
        }
    }

    return response.json();
};

//Delete user account
export const deleteAccount = async (): Promise<{ message: string }> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/api/Auth/delete-account`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    //Handle backend errors
    if (!response.ok) {
        const responseText = await response.text();
        try {
            const errorData = JSON.parse(responseText);
            const errorMessages = errorData.map((err: { description: string }) => err.description).join(', ');
            throw new Error(errorMessages || 'Account deletion failed');
        } catch (jsonError) {
            throw new Error(responseText || `Account deletion failed with status ${response.status}`);
        }
    }

    return response.json();
};

// Logout is handled client-side by clearing the token.