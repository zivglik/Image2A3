import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PhotoGrid from './pages/PhotoGrid';
import Home from './pages/Home';
import FlyerGrid from './pages/FlyerGrid';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/photo-grid" element={<PhotoGrid />} />
          <Route path="/flyer-grid" element={<FlyerGrid />} />
          {/* Add more routes here as needed */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 