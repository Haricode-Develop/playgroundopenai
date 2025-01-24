import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PlaygroundPage from './pages/PlaygroundPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PlaygroundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
