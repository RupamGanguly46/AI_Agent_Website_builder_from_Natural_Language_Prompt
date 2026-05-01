import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { SERVER_URL } from '../api/api';

function NetlifyCallback() {
    const [status, setStatus] = useState('Connecting to Netlify...');
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const query = new URLSearchParams(location.search);
            const code = query.get('code');
            const projectId = localStorage.getItem('netlify_deploy_project_id');

            if (!code) {
                setStatus('Failed to connect: No authorization code provided.');
                setTimeout(() => navigate(projectId ? `/workspace/${projectId}` : '/dashboard'), 3000);
                return;
            }

            try {
                let token = '';
                if (currentUser) {
                    token = await currentUser.getIdToken();
                }

                const redirectUri = window.location.origin + '/netlify/callback';

                const response = await fetch(`${SERVER_URL}/api/netlify/callback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ code, redirectUri })
                });

                if (response.ok) {
                    setStatus('Successfully connected to Netlify!');
                    setTimeout(() => {
                        if (projectId) {
                            localStorage.removeItem('netlify_deploy_project_id');
                            navigate(`/workspace/${projectId}?deploy=true`);
                        } else {
                            navigate('/dashboard');
                        }
                    }, 1500);
                } else {
                    const data = await response.json();
                    setStatus(`Failed: ${data.error || 'Unknown error'}`);
                    setTimeout(() => navigate(projectId ? `/workspace/${projectId}` : '/dashboard'), 3000);
                }
            } catch (error) {
                console.error(error);
                setStatus('Failed to connect: Server error.');
                setTimeout(() => navigate(projectId ? `/workspace/${projectId}` : '/dashboard'), 3000);
            }
        };

        handleCallback();
    }, [location.search, navigate, currentUser]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#131315] text-[#e5e1e4]">
            <Loader label={status} />
        </div>
    );
}

export default NetlifyCallback;
