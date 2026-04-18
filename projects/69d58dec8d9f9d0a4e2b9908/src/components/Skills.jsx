import React from 'react';
import './Skills.css';

const skillsList = [
    { name: 'JavaScript', icon: 'https://images.unsplash.com/photo-1628157563860-ee779977861b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8amF2YXNjcmlwdHx8fHx8fDE2NzY1NDMyMTc&ixlib=rb-4.0.3&q=80&w=400' },
    { name: 'CSS', icon: 'https://images.unsplash.com/photo-1628157563860-ee779977861b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Y3NzfHx8fHx8MTY3NjU0MzIxNw&ixlib=rb-4.0.3&q=80&w=400' },
    { name: 'HTML', icon: 'https://images.unsplash.com/photo-1628157563860-ee779977861b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8aHRtbHx8fHx8fDE2NzY1NDMyMTc&ixlib=rb-4.0.3&q=80&w=400' },
    { name: 'DSA', icon: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8YWxnb3JpdGhtc3x8fHx8fDE2NzY1NDMyMTc&ixlib=rb-4.0.3&q=80&w=400' },
    { name: 'Java', icon: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8amF2YXx8fHx8fDE2NzY1NDMyMTc&ixlib=rb-4.0.3&q=80&w=400' },
];

const Skills = () => {
    return (
        <section className="skills-section">
            <h2 className="skills-title">My Expertise</h2>
            <div className="skills-grid">
                {skillsList.map((skill, index) => (
                    <div key={index} className="skill-card">
                        <img src={skill.icon} alt={skill.name} className="skill-icon" />
                        <h3 className="skill-name">{skill.name}</h3>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Skills;
