import React, { useState, useEffect } from 'react';
import { X, User, Camera, Shield, Save, LogOut } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useNostr } from '../context/NostrContext';

const SettingsModal: React.FC = () => {
    const { isSettingsOpen, setSettingsOpen } = useUI();
    const { pubkey, logout, signEvent } = useAuth();
    const { relay } = useNostr();

    const [profile, setProfile] = useState({
        name: '',
        display_name: '',
        about: '',
        picture: '',
        website: ''
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isSettingsOpen && pubkey) {
            // Пробуем загрузить существующий профиль с нашего API
            fetch(`http://localhost:8080/api/profiles/${pubkey}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setProfile({
                            name: data.name || '',
                            display_name: data.display_name || '',
                            about: data.about || '',
                            picture: data.picture || '',
                            website: data.website || ''
                        });
                    }
                })
                .catch(err => console.log('No local profile found, starting fresh'));
        }
    }, [isSettingsOpen, pubkey]);

    if (!isSettingsOpen) return null;

    const handleSave = async () => {
        if (!pubkey || !relay) return;
        setIsSaving(true);

        try {
            const eventTemplate = {
                kind: 0,
                content: JSON.stringify(profile),
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                pubkey: pubkey
            };

            const signedEvent = await signEvent(eventTemplate);
            await relay.publish(signedEvent);
            console.log('Profile update sent to relay');
            
            setTimeout(() => {
                setIsSaving(false);
                setSettingsOpen(false);
            }, 1000);
        } catch (err) {
            console.error('Failed to save profile:', err);
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
            <div className="settings-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-title">
                        <Shield size={20} color="#7c4dd4" />
                        <h3>User Settings</h3>
                    </div>
                    <button className="close-btn" onClick={() => setSettingsOpen(false)}><X size={20} /></button>
                </div>

                <div className="modal-content">
                    <div className="profile-section">
                        <div className="avatar-edit">
                            <div className="avatar-preview">
                                {profile.picture ? <img src={profile.picture} alt="avatar" /> : <User size={40} color="#444458" />}
                            </div>
                            <button className="change-avatar-btn">
                                <Camera size={14} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Display Name</label>
                            <input 
                                type="text" 
                                value={profile.display_name} 
                                onChange={e => setProfile({...profile, display_name: e.target.value})}
                                placeholder="Your cool nickname"
                            />
                        </div>

                        <div className="form-group">
                            <label>Username (@name)</label>
                            <input 
                                type="text" 
                                value={profile.name} 
                                onChange={e => setProfile({...profile, name: e.target.value})}
                                placeholder="username"
                            />
                        </div>

                        <div className="form-group">
                            <label>About Me</label>
                            <textarea 
                                value={profile.about} 
                                onChange={e => setProfile({...profile, about: e.target.value})}
                                placeholder="Tell the world about yourself..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Avatar URL</label>
                            <input 
                                type="text" 
                                value={profile.picture} 
                                onChange={e => setProfile({...profile, picture: e.target.value})}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="danger-zone">
                        <label>Danger Zone</label>
                        <button className="logout-btn" onClick={() => { logout(); setSettingsOpen(false); }}>
                            <LogOut size={16} /> Logout from Session
                        </button>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={() => setSettingsOpen(false)}>Cancel</button>
                    <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                    </button>
                </div>
            </div>

            <style>{`
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
                .settings-modal { width: 440px; background: #0f0f12; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
                .modal-header { padding: 16px 20px; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; }
                .header-title { display: flex; align-items: center; gap: 10px; }
                .header-title h3 { font-size: 15px; font-weight: 700; color: #f1f5f9; }
                .close-btn { background: none; border: none; color: #64748b; cursor: pointer; }
                
                .modal-content { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
                
                .avatar-edit { display: flex; flex-direction: column; align-items: center; margin-bottom: 12px; position: relative; width: fit-content; margin-left: auto; margin-right: auto; }
                .avatar-preview { width: 80px; height: 80px; background: #1a1a22; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 2px solid #7c4dd4; }
                .avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
                .change-avatar-btn { position: absolute; bottom: 0; right: 0; background: #7c4dd4; color: white; border: none; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
                
                .form-group { display: flex; flex-direction: column; gap: 6px; }
                .form-group label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
                .form-group input, .form-group textarea { background: #1a1a22; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 12px; color: white; font-size: 14px; outline: none; transition: border-color 0.2s; }
                .form-group input:focus, .form-group textarea:focus { border-color: #7c4dd4; }
                .form-group textarea { height: 80px; resize: none; }
                
                .danger-zone { margin-top: 12px; padding-top: 20px; border-top: 1px solid #1e293b; }
                .danger-zone label { font-size: 11px; font-weight: 700; color: #ef4444; text-transform: uppercase; margin-bottom: 8px; display: block; }
                .logout-btn { width: 100%; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
                .logout-btn:hover { background: #ef4444; color: white; }
                
                .modal-footer { padding: 16px 20px; background: #0a0a0f; border-top: 1px solid #1e293b; display: flex; justify-content: flex-end; gap: 12px; }
                .cancel-btn { background: none; border: none; color: #64748b; font-weight: 600; cursor: pointer; }
                .save-btn { background: #7c4dd4; color: white; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
                .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default SettingsModal;
