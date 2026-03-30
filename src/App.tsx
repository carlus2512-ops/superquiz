/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Trophy, ChartColumn, Settings } from 'lucide-react';
import LoadingScreen from './components/LoadingScreen';

// Lazy load components
const Welcome = React.lazy(() => import('./components/Welcome'));
const Game = React.lazy(() => import('./components/Game'));
const Admin = React.lazy(() => import('./components/Admin'));
const HighScores = React.lazy(() => import('./components/HighScores'));
const Stats = React.lazy(() => import('./components/Stats'));
const ContentManager = React.lazy(() => import('./components/ContentManager'));

function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  if (location.pathname === '/game') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/5 backdrop-blur-xl border-t border-white/10 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center p-3">
        <Link to="/" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>
          <Home size={24} />
          <span className="text-xs font-medium">Início</span>
        </Link>
        <Link to="/highscores" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/highscores') ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>
          <Trophy size={24} />
          <span className="text-xs font-medium">Ranking</span>
        </Link>
        <Link to="/stats" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/stats') ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>
          <ChartColumn size={24} />
          <span className="text-xs font-medium">Estatísticas</span>
        </Link>
        <Link to="/admin" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/admin') || location.pathname.startsWith('/admin/') ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>
          <Settings size={24} />
          <span className="text-xs font-medium">Painel</span>
        </Link>
      </div>
    </nav>
  );
}

function AppContent() {
  const location = useLocation();
  const isGameRoute = location.pathname === '/game';

  return (
    <div className={`min-h-screen bg-gradient-to-r from-sky-600 via-sky-600 to-sky-600 text-slate-100 ${isGameRoute ? '' : 'pb-16'}`}>
      {/* Background decorative elements
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-600/20 blur-[120px]"></div>
        <div className="absolute top-[20%] left-[60%] w-[30%] h-[30%] rounded-full bg-pink-600/20 blur-[100px]"></div>
      </div> */}
      
      <div className="relative z-10">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/game" element={<Game />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/content" element={<ContentManager />} />
            <Route path="/highscores" element={<HighScores />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </Suspense>
        <Navigation />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}