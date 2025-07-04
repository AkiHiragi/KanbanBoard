import React from "react";
import {useTheme} from "../contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
    const {theme, toggleTheme} = useTheme();

    return (
        <button
            className={'theme-toggle'}
            onClick={toggleTheme}
            title={`Переключить на ${theme === 'light' ? 'темную' : 'светлую'} тему}`}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
};

export default ThemeToggle;