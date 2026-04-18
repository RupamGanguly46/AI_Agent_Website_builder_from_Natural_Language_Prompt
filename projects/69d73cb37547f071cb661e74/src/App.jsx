import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SkillsPage from './pages/SkillsPage';
import './App.css'; // Keep App.css for global styles

function App() {
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/skills" element={<SkillsPage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;
