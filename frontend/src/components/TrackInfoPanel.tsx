import React from 'react';
import { Music as MusicIcon, Heart, ListPlus, Share2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const TrackInfoPanel: React.FC = () => {
    const { currentTrack } = usePlayer();

    if (!currentTrack) {
        return (
            <aside className="track-info-panel empty">
                <div className="empty-message">Выберите трек, чтобы увидеть детали</div>
            </aside>
        );
    }

    return (
        <aside className="track-info-panel">
            <div className="info-header">ДЕТАЛИ ТРЕКА</div>
            
            <div className="large-cover-container">
                {currentTrack.cover && currentTrack.cover.startsWith('http') ? (
                    <img src={currentTrack.cover} alt="cover" className="large-cover" />
                ) : (
                    <div className="large-cover-placeholder">
                        <MusicIcon size={64} color="rgba(255,255,255,0.1)" />
                    </div>
                )}
            </div>

            <div className="track-details">
                <h1 className="track-title-large">{currentTrack.title}</h1>
                <h2 className="track-artist-large">{currentTrack.artist}</h2>
                <div className="track-album-info">BIXGRAM ORIGINAL ALBUM · 2026</div>
            </div>

            <div className="track-tags">
                <span className="tag">Electronic</span>
                <span className="tag">Cyberpunk</span>
                <span className="tag">Nostr</span>
            </div>

            <div className="action-buttons">
                <button className="action-btn like">
                    <Heart size={20} />
                    <span>Нравится</span>
                </button>
                <button className="action-btn playlist">
                    <ListPlus size={20} />
                    <span>В плейлист</span>
                </button>
            </div>

            <style>{`
                .track-info-panel {
                    width: 320px;
                    background: #0f0f12;
                    border-left: 1px solid #1e293b;
                    display: flex;
                    flex-direction: column;
                    padding: 24px;
                    height: 100%;
                }
                .track-info-panel.empty {
                    align-items: center;
                    justify-content: center;
                }
                .empty-message {
                    color: #64748b;
                    font-size: 13px;
                    text-align: center;
                }
                .info-header {
                    font-size: 11px;
                    font-weight: 800;
                    color: #64748b;
                    letter-spacing: 1.5px;
                    margin-bottom: 24px;
                }
                .large-cover-container {
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    border-radius: 12px;
                    overflow: hidden;
                    background: #1e293b;
                    margin-bottom: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .large-cover {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .large-cover-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .track-title-large {
                    font-size: 24px;
                    font-weight: 800;
                    color: #f1f5f9;
                    margin-bottom: 4px;
                }
                .track-artist-large {
                    font-size: 16px;
                    font-weight: 600;
                    color: #a78bfa;
                    margin-bottom: 16px;
                }
                .track-album-info {
                    font-size: 12px;
                    color: #64748b;
                    margin-bottom: 24px;
                }
                .track-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 32px;
                }
                .tag {
                    background: #1e293b;
                    color: #94a3b8;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                }
                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: auto;
                }
                .action-btn {
                    width: 100%;
                    height: 48px;
                    border-radius: 10px;
                    border: 1px solid #1e293b;
                    background: transparent;
                    color: #f1f5f9;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 600;
                }
                .action-btn:hover {
                    background: #1e293b;
                    border-color: #334155;
                }
                .action-btn.like:hover {
                    color: #f87171;
                    border-color: rgba(248, 113, 113, 0.3);
                }
            `}</style>
        </aside>
    );
};

export default TrackInfoPanel;
