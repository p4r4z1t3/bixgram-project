import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NostrProvider } from './context/NostrContext';
import { UIProvider, useUI } from './context/UIContext';
import { PlayerProvider } from './context/PlayerContext';
import VinylPlayer from './components/VinylPlayer';
import NavRail from './components/NavRail';
import Login from './pages/Login';
import Register from './pages/Register';
import SettingsModal from './components/SettingsModal';
import './index.css';

import ChatView from './components/ChatView';
import BottomPlayer from './components/BottomPlayer';
import LibraryPanel from './components/LibraryPanel';
import TrackInfoPanel from './components/TrackInfoPanel';

const AppContent: React.FC = () => {
    const { mode } = useUI();
    
    return (
        <div className="app-layout">
            <NavRail />
            <div className="main-container">
                {mode === 'music' && (
                    <div className="left-panel">
                        <LibraryPanel />
                    </div>
                )}
                <div className="center-right-column">
                    <div className="content-area">
                        {mode === 'music' ? <VinylPlayer /> : <ChatView />}
                    </div>
                    <BottomPlayer />
                </div>
                {mode === 'music' && (
                    <div className="right-panel">
                        <TrackInfoPanel />
                    </div>
                )}
            </div>

            <SettingsModal />

            <style>{`
                .app-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: #070708; }
                .main-container { display: flex; flex: 1; min-width: 0; }
                .left-panel { width: 280px; flex-shrink: 0; border-right: 0.5px solid #1a1a22; }
                .center-right-column { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #070708; }
                .content-area { flex: 1; display: flex; overflow: hidden; position: relative; }
                .right-panel { width: 280px; flex-shrink: 0; border-left: 0.5px solid #1a1a22; background: #0f0f12; }
            `}</style>
        </div>
    );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pubkey, loading } = useAuth();
  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;
  if (!pubkey) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NostrProvider>
        <UIProvider>
          <PlayerProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/" 
                  element={
                    <PrivateRoute>
                      <AppContent />
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </PlayerProvider>
        </UIProvider>
      </NostrProvider>
    </AuthProvider>
  );
};

export default App;
