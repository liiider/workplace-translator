import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Result from './pages/Result';

function App() {
    return (
        <Router>
            <div className="h-[100dvh] w-full bg-zinc-950 overflow-hidden relative">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/result" element={<Result />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
