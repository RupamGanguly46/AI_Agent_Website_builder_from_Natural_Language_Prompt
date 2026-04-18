import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1 className="hero-title">Hello, I'm <span className="highlight">Alex Smith</span>!</h1>
                <p className="hero-subtitle">A passionate developer building vibrant web experiences.</p>
                <button className="hero-button">Explore My Work</button>
            </div>
            <div className="hero-image-container">
                <img src="https://via.placeholder.com/400x400/8a2be2/ffffff?text=Your+Photo" alt="Alex Smith" className="hero-image" />
            </div>
        </section>
    );
};

export default Hero;
