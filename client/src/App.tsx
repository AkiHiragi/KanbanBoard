import React from 'react';
import './App.css';
import KanbanBoard from "./components/KanbanBoard";
import {ThemeProvider} from "./contexts/ThemeContext";

function App() {
    return (
        <ThemeProvider>
            <div className="App">
                <KanbanBoard/>
            </div>
        </ThemeProvider>
    );
}

export default App;
