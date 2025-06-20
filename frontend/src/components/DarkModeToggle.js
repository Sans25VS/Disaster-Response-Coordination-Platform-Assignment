import React from 'react';
import './../styles/DarkMode.css';

const DarkModeToggle = ({ darkMode, toggleDarkMode }) => {
    return (
        <div className="toggle-switch-container">
            <div className={`toggle-switch ${darkMode ? 'dark' : 'light'}`} onClick={toggleDarkMode}>
                <div className="toggle-knob">
                    {darkMode ? '🌙' : '☀️'}
                </div>
            </div>
        </div>
    );
};

export default DarkModeToggle; 