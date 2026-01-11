import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../types/user';
import type { LoginDto } from '../types/auth';
import * as authService from './AuthService';
import { setToken as storeToken, clearToken as clearTokenStore } from './tokenStore';

interface AuthContextType { // Define the shape of the auth context
    user: User | null;
    token: string | null;
    login: (credentials: LoginDto) => Promise<User>;
    logout: () => void;
    deleteAccount: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => { // Check token validity on mount and when token changes
        if (token) {
            try {
                const decodedUser: User = jwtDecode(token);
                // Check if the token is expired
                if (decodedUser.exp * 1000 > Date.now()) {
                    setUser(decodedUser);
                    // Sync token to shared store for HTTP wrapper
                    storeToken(token);
                } else {
                    // Token is expired, clear it
                    console.warn("Token expired");
                    localStorage.removeItem('token');
                    setUser(null);
                    setToken(null);
                    clearTokenStore();
                }
            } catch (error) {
                // Invalid token format -> clear everything
                console.error("Invalid token", error);
                localStorage.removeItem('token');
                setUser(null);
                setToken(null);
                clearTokenStore();
            }
        } else {
            // No token -> ensure user is cleared
            setUser(null);
            clearTokenStore();
        }
        setIsLoading(false);
    }, [token]);

    // Login function
    const login = async (credentials: LoginDto): Promise<User> => { // Login and store token
        const { token } = await authService.login(credentials);
        localStorage.setItem('token', token);
        const decodedUser: User = jwtDecode(token); // Decode user info from token

        setUser(decodedUser);
        setToken(token);
        storeToken(token);
        return decodedUser;
    };

    const logout = () => { // Clear token and user data
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        clearTokenStore();
    };

    const deleteAccount = async (): Promise<void> => { // Delete account and clear token and user data
        await authService.deleteAccount();
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        clearTokenStore();
    };

    return ( // Provide context to children
        <AuthContext.Provider value={{ user, token, login, logout, deleteAccount, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => { // Custom hook to use auth context
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};