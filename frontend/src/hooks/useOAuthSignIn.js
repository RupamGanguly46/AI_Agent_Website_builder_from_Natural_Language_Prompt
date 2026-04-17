import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebaseConfig';
import {
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import api from '../api/api';

/**
 * Shared hook for Google / GitHub OAuth popup sign-in.
 * Handles both new user sign-up and returning user login automatically.
 */
export function useOAuthSignIn() {
    const navigate = useNavigate();

    const signInWithProvider = async (provider, setError, setLoading) => {
        try {
            setError('');
            setLoading(true);

            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Force-refresh token so the axios interceptor sends a valid JWT
            await user.getIdToken(true);

            // Upsert the user profile in MongoDB (idempotent — safe to call every login)
            await api.post('/users/sync', {
                email: user.email,
                name: user.displayName || user.email.split('@')[0],
            });

            navigate('/dashboard');
        } catch (err) {
            // User closed the popup — don't show an error for that
            if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = (setError, setLoading) => {
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        return signInWithProvider(provider, setError, setLoading);
    };

    const signInWithGitHub = (setError, setLoading) => {
        const provider = new GithubAuthProvider();
        provider.addScope('read:user');
        provider.addScope('user:email');
        return signInWithProvider(provider, setError, setLoading);
    };

    return { signInWithGoogle, signInWithGitHub };
}
