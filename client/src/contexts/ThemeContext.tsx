import React, {createContext, useContext, useEffect, useState} from "react";

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme,
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [theme, seTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('kanban-theme');
        return (saved as Theme) || 'light';
    });

    useEffect(() => {
        localStorage.setItem('kanban-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);
    
    const toggleTheme = () => {
        seTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };
    
    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};