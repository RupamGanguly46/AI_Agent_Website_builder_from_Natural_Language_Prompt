import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const API_BASE = 'http://127.0.0.1:5000';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return () => {};
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            // Auto-sync user to MongoDB when they log in
            if (user) {
                try {
                    const idToken = await user.getIdToken();
                    await fetch(`${API_BASE}/users/sync`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${idToken}`,
                        },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.displayName || user.email?.split('@')[0] || 'User',
                        }),
                    });
                } catch (err) {
                    console.warn('User sync failed (non-critical):', err.message);
                }
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = () => {
        if (auth) return signOut(auth);
    };

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
