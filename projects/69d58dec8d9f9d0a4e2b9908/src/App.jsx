import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Footer from './components/Footer';
import './App.css';

function App() {
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Hero />} />
                    <Route path="/skills" element={<Skills />} />
                    {/* Add more routes as needed */}
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;
