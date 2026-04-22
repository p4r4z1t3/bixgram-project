import React from 'react';
import { ChevronRight, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Music as MusicIcon } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { usePlayer } from '../context/PlayerContext';
import MusicUpload from './MusicUpload';

const MusicSlidingPanel: React.FC = () => {
    const { isMusicPanelOpen, setMusicPanelOpen } = useUI();
    const { isPlaying, togglePlay, nextTrack, prevTrack, currentTrack, playlist, setCurrentTrackIndex, currentTrackIndex } = usePlayer();

    return (
        <aside className={`sliding-music-panel ${isMusicPanelOpen ? 'open' : ''}`}>
            <div className="panel-header">
                <span>СЕЙЧАС ИГРАЕТ</span>
                <button onClick={() => setMusicPanelOpen(false)} className="close-panel-btn">
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="panel-scroll-content">
                <div className="track-card-preview">
                    {currentTrack?.cover && currentTrack.cover.startsWith('http') ? (
                        <img src={currentTrack.cover} alt="cover" className="preview-cover" />
                    ) : (
                        <div className={`preview-cover-placeholder gradient1`}>
                            <MusicIcon size={40} color="rgba(255,255,255,0.3)" />
                        </div>
                    )}
                    <div className="preview-info">
                        <div className="preview-title">{currentTrack?.title || 'Unknown'}</div>
                        <div className="preview-artist-album">
                            {currentTrack?.artist || 'Unknown'} · BIXGRAM ALBUM
                        </div>
                    </div>
                </div>

                <div className="mini-progress">
                    <div className="progress-bar-mini">
                        <div className="progress-fill-mini" style={{ width: '35%' }}></div>
                    </div>
                    <div className="mini-times">
                        <span>0:45</span>
                        <span>{currentTrack?.duration || '0:00'}</span>
                    </div>
                </div>

                <div className="mini-controls">
                    <button className="mini-btn"><Shuffle size={14} /></button>
                    <button onClick={prevTrack} className="mini-btn"><SkipBack size={16} /></button>
                    <button onClick={togglePlay} className="mini-play-btn">
                        {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />}
                    </button>
                    <button onClick={nextTrack} className="mini-btn"><SkipForward size={16} /></button>
                    <button className="mini-btn"><Repeat size={14} /></button>
                </div>

                <MusicUpload />

                <div className="section-label">ПЛЕЙЛИСТ · {playlist.length} ТРЕКОВ</div>
                
                <div className="mini-playlist">
                    {playlist.map((track, idx) => (
                        <div 
                            key={track.id} 
                            className={`mini-playlist-item ${idx === currentTrackIndex ? 'active' : ''}`}
                            onClick={() => setCurrentTrackIndex(idx)}
                        >
                            <div className="mini-item-cover" style={{
                                backgroundImage: track.cover.startsWith('http') ? `url(${track.cover})` : 'none',
                                backgroundSize: 'cover'
                            }}>
                                {idx === currentTrackIndex && isPlaying && <div className="eq-bar"></div>}
                            </div>
                            <div className="mini-item-info">
                                <div className="mini-item-title">{track.title}</div>
                                <div className="mini-item-artist">{track.artist}</div>
                            </div>
                            <div className="mini-item-duration">{track.duration}</div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .sliding-music-panel {
                    width: 0;
                    height: 100%;
                    background: #0f0f11;
                    border-left: 0.5px solid #1e293b;
                    transition: width 0.3s ease;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .sliding-music-panel.open {
                    width: 230px;
                }
                .panel-header {
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #94a3b8;
                    letter-spacing: 1px;
                    border-bottom: 0.5px solid #1e293b;
                }
                .close-panel-btn {
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 4px;
                }
                .panel-scroll-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }
                .track-card-preview {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .preview-cover {
                    width: 100%;
                    height: 140px;
                    border-radius: 10px;
                    object-fit: cover;
                }
                .preview-cover-placeholder {
                    width: 100%;
                    height: 140px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .gradient1 { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
                .preview-title { font-size: 13px; font-weight: 700; color: #f1f5f9; }
                .preview-artist-album { font-size: 11px; color: #a78bfa; }
                
                .mini-progress { margin-bottom: 16px; }
                .progress-bar-mini { height: 2px; background: #1e293b; border-radius: 1px; }
                .progress-fill-mini { height: 100%; background: #a78bfa; border-radius: 1px; }
                .mini-times { display: flex; justify-content: space-between; font-size: 9px; color: #64748b; margin-top: 4px; }
                
                .mini-controls { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
                .mini-btn { background: none; border: none; color: #94a3b8; cursor: pointer; }
                .mini-play-btn { background: #3b82f6; width: 36px; height: 36px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                
                .section-label { font-size: 10px; font-weight: 700; color: #64748b; margin-bottom: 12px; }
                .mini-playlist { display: flex; flex-direction: column; gap: 8px; }
                .mini-playlist-item { display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 6px; cursor: pointer; }
                .mini-playlist-item:hover { background: rgba(255,255,255,0.03); }
                .mini-playlist-item.active { background: rgba(167, 139, 250, 0.1); }
                .mini-item-cover { width: 26px; height: 26px; border-radius: 4px; background: #334155; }
                .mini-item-info { flex: 1; min-width: 0; }
                .mini-item-title { font-size: 11px; font-weight: 600; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .mini-item-artist { font-size: 10px; color: #64748b; }
                .mini-item-duration { font-size: 10px; color: #64748b; }
            `}</style>
        </aside>
    );
};

export default MusicSlidingPanel;
