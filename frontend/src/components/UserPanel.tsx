import React, { useState, useEffect } from 'react';
import { Mic, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const UserPanel: React.FC = () => {
    const { pubkey } = useAuth();
    const { setSettingsOpen } = useUI();
    const [profile, setProfile] = useState<{ display_name?: string; name?: string; picture?: string }>({});

    useEffect(() => {
        if (!pubkey) return;
        fetch(`http://localhost:8080/api/profiles/${pubkey}`)
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setProfile({
                        display_name: data.display_name,
                        name: data.name,
                        picture: data.picture
                    });
                }
            })
            .catch(() => {});
    }, [pubkey]);

    const displayName = profile.display_name || (profile.name ? `@${profile.name}` : (pubkey ? `${pubkey.slice(0, 8)}...` : 'Unknown'));

    return (
        <div className="user-panel-discord">
            <div className="user-info-section" onClick={() => setSettingsOpen(true)} style={{ cursor: 'pointer' }}>
                <div className="avatar-small">
                    {profile.picture ? (
                        <img src={profile.picture} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        displayName.charAt(0).toUpperCase()
                    )}
                    <div className="status-dot-online"></div>
                </div>
                <div className="name-status">
                    <div className="user-name" title={displayName}>{displayName}</div>
                    <div className="online-label">в сети</div>
                </div>
            </div>
            <div className="panel-actions">
                <button className="panel-icon-btn" title="Настройки профиля" onClick={() => setSettingsOpen(true)}>
                    <Settings size={16} />
                </button>
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
