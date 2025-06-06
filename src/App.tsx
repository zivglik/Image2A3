import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PhotoGrid from './pages/PhotoGrid';
import Home from './pages/Home';
import FlyerGrid from './pages/FlyerGrid';
import CollagePage from './pages/CollagePage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/photo-grid" element={<PhotoGrid />} />
          <Route path="/flyer-grid" element={<FlyerGrid />} />
          <Route path="/collage" element={<CollagePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 