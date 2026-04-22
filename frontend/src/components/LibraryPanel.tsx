import React, { useState } from 'react';
import { Library, Plus, Music as MusicIcon, Mic, Settings } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import UploadModal from './UploadModal';

const LibraryPanel: React.FC = () => {
    const { playlist, currentTrackIndex, setCurrentTrackIndex } = usePlayer();
    const { pubkey } = useAuth();
    const [activeTab, setActiveTab] = useState<'my' | 'liked'>('my');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const handleTrackClick = (idx: number) => {
        setCurrentTrackIndex(idx);
        setIsPlaying(true);
    };

    return (
        <aside className="library-panel">
            <div className="library-header">
                <div className="title">
                    <Library size={20} />
                    <span>Библиотека</span>
                </div>
                <button className="upload-trigger-btn" onClick={() => setIsUploadModalOpen(true)}>
                    <Plus size={18} />
                    <span>Загрузить</span>
                </button>
            </div>

            <div className="library-tabs">
                <button 
                    className={activeTab === 'my' ? 'active' : ''} 
                    onClick={() => setActiveTab('my')}
                >
                    Мои треки
                </button>
                <button 
                    className={activeTab === 'liked' ? 'active' : ''} 
                    onClick={() => setActiveTab('liked')}
                >
                    Понравившиеся
                </button>
            </div>

            <div className="track-list-scroll">
                {playlist.length > 0 ? playlist.map((track, idx) => (
                    <div 
                        key={track.id} 
                        className={`library-track-item ${idx === currentTrackIndex ? 'active' : ''}`}
                        onClick={() => handleTrackClick(idx)}
                    >
                        <div className="track-cover-mini" style={{
                            backgroundImage: track.cover.startsWith('http') ? `url(${track.cover})` : 'none',
                            backgroundColor: '#1e293b',
                            backgroundSize: 'cover'
                        }}>
                            {!track.cover.startsWith('http') && <MusicIcon size={14} color="#64748b" />}
                        </div>
                        <div className="track-meta">
                            <div className="track-name">{track.title}</div>
                            <div className="track-artist">{track.artist}</div>
                        </div>
                        <div className="track-duration">{track.duration}</div>
                    </div>
                )) : (
                    <div className="empty-state">Нет треков в библиотеке</div>
                )}
            </div>

            {/* Discord-style User Plate */}
            <div className="user-profile-plate">
                <div className="user-avatar-wrap">
                    <div className="user-avatar">
                        {pubkey ? pubkey[0].toUpperCase() : 'B'}
                    </div>
                    <div className="status-dot online"></div>
                </div>
                <div className="user-info">
                    <div className="user-name">{pubkey ? pubkey.slice(0, 8) : 'Anonymous'}</div>
                    <div className="user-status">в сети</div>
                </div>
                <div className="user-actions">
                    <button className={`action-icon ${isMuted ? 'muted' : ''}`} onClick={() => setIsMuted(!isMuted)}>
                        <Mic size={16} />
                    </button>
                    <button className="action-icon">
                        <Settings size={16} />
                    </button>
                </div>
            </div>

            <UploadModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={() => {
                    // Здесь можно добавить логику обновления списка
                    console.log('Upload success!');
                }}
            />

            <style>{`
                .library-panel {
                    width: 280px;
                    min-width: 280px;
                    background: #0f0f12;
                    border-right: 0.5px solid #1a1a22;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: visible;
                }
                .library-header {
                    padding: 20px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .library-header .title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 700;
                    color: #f1f5f9;
                    font-size: 14px;
                }
                .upload-trigger-btn {
                    background: #1e293b;
                    border: none;
                    color: #60a5fa;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .upload-trigger-btn:hover {
                    background: #334155;
                    transform: scale(1.05);
                }
                .library-tabs {
                    display: flex;
                    padding: 0 16px;
                    gap: 16px;
                    margin-bottom: 10px;
                }
                .library-tabs button {
                    background: none;
                    border: none;
                    color: #444458;
                    font-size: 12px;
                    font-weight: 700;
                    padding-bottom: 8px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .library-tabs button.active {
                    color: #60a5fa;
                    border-bottom-color: #60a5fa;
                }
                .track-list-scroll {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px 12px;
                }
                .library-track-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px;
                    margin-bottom: 2px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.1s;
                }
                .library-track-item:hover {
                    background: rgba(255,255,255,0.03);
                }
                .library-track-item.active {
                    background: rgba(96, 165, 250, 0.08);
                }
                .track-cover-mini {
                    width: 32px;
                    height: 32px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .track-meta {
                    flex: 1;
                    min-width: 0;
                }
                .track-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: #e0e0f0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .track-artist {
                    font-size: 11px;
                    color: #444458;
                }
                .track-duration {
                    font-size: 11px;
                    color: #444458;
                }
                .empty-state {
                    padding: 40px 0;
                    text-align: center;
                    color: #444458;
                    font-size: 12px;
                }

                /* User Plate Styles */
                .user-profile-plate {
                    padding: 10px 12px;
                    background: #0a0a0f;
                    border-top: 0.5px solid #1a1a22;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .user-avatar-wrap {
                    position: relative;
                }
                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #7c4dd4;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                }
                .status-dot {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: 2px solid #0a0a0f;
                }
                .status-dot.online { background: #22c55e; }
                .user-info {
                    flex: 1;
                    min-width: 0;
                }
                .user-name {
                    font-size: 13px;
                    font-weight: 700;
                    color: #e0e0f0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .user-status {
                    font-size: 11px;
                    color: #444458;
                }
                .user-actions {
                    display: flex;
                    gap: 4px;
                }
                .action-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 4px;
                    background: none;
                    border: none;
                    color: #b0b0c0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .action-icon:hover { background: rgba(255,255,255,0.05); color: white; }
                .action-icon.muted { color: #ef4444; }
            `}</style>
        </aside>
    );
};

export default LibraryPanel;
