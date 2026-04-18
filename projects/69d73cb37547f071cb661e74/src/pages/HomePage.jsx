import React from 'react';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-page">
            <div className="home-content">
                <h1>Welcome to My Vibrant Portfolio!</h1>
                <p>Showcasing my passion for web development and problem-solving.</p>
                <button className="cta-button" onClick={() => window.location.href='/skills'}>
                    View My Skills
                </button>
            </div>
        </div>
    );
};

export default HomePage;
