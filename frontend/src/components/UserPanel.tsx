import React from 'react';
import { Mic, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserPanel: React.FC = () => {
    const { pubkey } = useAuth();
    const npub = pubkey?.slice(0, 8) || 'Unknown';

    return (
        <div className="user-panel-discord">
            <div className="user-info-section">
                <div className="avatar-small">
                    {npub[0].toUpperCase()}
                    <div className="status-dot-online"></div>
                </div>
                <div className="name-status">
                    <div className="user-name">{npub}</div>
                    <div className="online-label">в сети</div>
                </div>
            </div>
            <div className="panel-actions">
                <button className="panel-icon-btn"><Mic size={16} /></button>
                <button className="panel-icon-btn"><Settings size={16} /></button>
            </div>

            <style>{`
                .user-panel-discord {
                    height: 52px;
                    background: #121214;
                    border-top: 0.5px solid #1e293b;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 10px;
                    margin-top: auto;
                }
                .user-info-section {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .avatar-small {
                    width: 30px;
                    height: 30px;
                    background: #3b82f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                    color: white;
                    position: relative;
                }
                .status-dot-online {
                    position: absolute;
                    bottom: -1px;
                    right: -1px;
                    width: 10px;
                    height: 10px;
                    background: #22c55e;
                    border: 2px solid #121214;
                    border-radius: 50%;
                }
                .name-status {
                    display: flex;
                    flex-direction: column;
                }
                .user-name {
                    font-size: 12px;
                    font-weight: 600;
                    color: #f1f5f9;
                    max-width: 60px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .online-label {
                    font-size: 10px;
                    color: #22c55e;
                    line-height: 1;
                }
                .panel-actions {
                    display: flex;
                    gap: 2px;
                }
                .panel-icon-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    padding: 6px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .panel-icon-btn:hover {
                    background: rgba(255,255,255,0.05);
                    color: #f1f5f9;
                }
            `}</style>
        </div>
    );
};

export default UserPanel;
