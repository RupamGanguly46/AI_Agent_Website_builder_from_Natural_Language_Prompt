import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    const logout = () => signOut(auth);

    const value = {
        currentUser,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
