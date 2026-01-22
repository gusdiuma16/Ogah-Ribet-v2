import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Berbagi from './pages/Berbagi';
import Transparency from './pages/Transparency';
import Admin from './pages/Admin';
// import MapPage from './pages/MapPage'; // Temporarily disabled

// Wrapper to conditionally hide Navbar/Footer on immersive pages if needed
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isImmersive = location.pathname === '/berbagi';
  
  // We still show Navbar on 'Berbagi' but styling might be different inside the page components
  // Actually, for the 'Berbagi' page based on requirement, it has its own back button logic in immersive mode.
  // But let's keep the main Navbar visible unless it's video mode (handled inside Berbagi component via z-index).
  // However, standard Nav might clash with the transparent header design of Berbagi.
  // Let's hide the standard Navbar for '/berbagi' to allow that page to control its own header.
  
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {!isImmersive && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isImmersive && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/berbagi" element={<Berbagi />} />
          {/* <Route path="/peta" element={<MapPage />} /> */}
          <Route path="/transparansi" element={<Transparency />} />
          <Route path="/hidden-admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;