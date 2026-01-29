import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Result from './pages/Result';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background-light dark:bg-zinc-950">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/result" element={<Result />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
