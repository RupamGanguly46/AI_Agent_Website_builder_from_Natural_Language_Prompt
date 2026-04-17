import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
    const location = useLocation();
    const hideNavAndFooter = location.pathname.startsWith('/dashboard');

    return (
        <div className="app-root font-body text-on-background selection:bg-primary selection:text-black min-h-screen flex flex-col">
            {!hideNavAndFooter && <Navbar />}
            <main className={`main-content flex-grow flex flex-col ${!hideNavAndFooter ? 'pt-16' : ''}`}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/workspace/:projectId" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Routes>
            </main>
            {!hideNavAndFooter && <Footer />}
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
