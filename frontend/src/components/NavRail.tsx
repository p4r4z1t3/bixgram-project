import React from 'react';
import { MessageSquare, Music, Star, Settings } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

const NavRail: React.FC = () => {
    const { mode, setMode, setSettingsOpen } = useUI();
    const { pubkey } = useAuth();

    return (
        <aside className="nav-rail">
            <div className="nav-items-top">
                <button 
                    className={`rail-item ${mode === 'chat' ? 'active' : ''}`} 
                    onClick={() => setMode('chat')}
                >
                    <MessageSquare size={22} />
                </button>
                <button 
                    className={`rail-item ${mode === 'music' ? 'active' : ''}`} 
                    onClick={() => setMode('music')}
                >
                    <Music size={22} />
                </button>
                <div className="rail-divider"></div>
                <button className="rail-item">
                    <Star size={22} />
                </button>
                <button className="rail-item" onClick={() => setSettingsOpen(true)}>
                    <Settings size={22} />
                </button>
            </div>
            
            <div className="nav-items-bottom">
                <div className="user-avatar-container">
                    <div className="avatar-circle">
                        {pubkey?.[0].toUpperCase()}
                    </div>
                    <div className="online-indicator"></div>
                </div>
            </div>

            <style>{`
                .nav-rail {
                    width: 54px;
                    background: #09090a;
                    border-right: 1px solid #1e293b;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 12px 0;
                    z-index: 200;
                }
                .nav-items-top {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                .rail-item {
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .rail-item:hover {
                    color: #f1f5f9;
                    background: rgba(255,255,255,0.05);
                }
                .rail-item.active {
                    color: #a78bfa;
                    background: rgba(167, 139, 250, 0.15);
                }
                .rail-divider {
                    width: 30px;
                    height: 1px;
                    background: #1e293b;
                    margin: 4px 0;
                }
                .nav-items-bottom {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-bottom: 10px;
                }
                .user-avatar-container {
                    position: relative;
                    cursor: pointer;
                }
                .avatar-circle {
                    width: 30px;
                    height: 30px;
                    background: #3b82f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 700;
                    color: white;
                }
                .online-indicator {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 10px;
                    height: 10px;
                    background: #22c55e;
                    border: 2px solid #09090a;
                    border-radius: 50%;
                }
            `}</style>
        </aside>
    );
};

export default NavRail;
