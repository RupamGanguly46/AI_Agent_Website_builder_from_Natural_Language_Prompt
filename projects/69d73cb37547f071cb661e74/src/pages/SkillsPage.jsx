import React from 'react';
import './SkillsPage.css';

const skills = [
    { name: 'JavaScript', description: 'Proficient in modern JS, ES6+, DOM manipulation.', color: '#f7df1e', textColor: '#333' },
    { name: 'CSS', description: 'Expert in responsive design, Flexbox, Grid, animations.', color: '#264de4', textColor: '#fff' },
    { name: 'HTML', description: 'Strong understanding of semantic HTML5 structure.', color: '#e34c26', textColor: '#fff' },
    { name: 'DSA', description: 'Solid grasp of Data Structures and Algorithms.', color: '#9c27b0', textColor: '#fff' },
    { name: 'Java', description: 'Experienced in Java for backend and competitive programming.', color: '#f89820', textColor: '#333' },
];

const SkillsPage = () => {
    return (
        <div className="skills-page">
            <h2 className="skills-title">My Core Skills</h2>
            <div className="skills-grid">
                {skills.map((skill, index) => (
                    <div className="skill-card" key={index} style={{ backgroundColor: skill.color, color: skill.textColor }}>
                        <h3>{skill.name}</h3>
                        <p>{skill.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkillsPage;
