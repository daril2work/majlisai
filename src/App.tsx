import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { Feed } from './pages/Feed';
import { MapView } from './pages/MapView';
import { EventDetail } from './pages/EventDetail';
import { Admin } from './pages/Admin';
import { About } from './pages/About';
import { Search } from './pages/Search';
import { SplashScreen } from './components/SplashScreen';

function App() {
  return (
    <Router>
      <SplashScreen />
      <Layout>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" expand richColors theme="dark" />
    </Router>
  );
}

export default App;
