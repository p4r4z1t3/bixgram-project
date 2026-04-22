import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Search, Music as MusicIcon, Disc, Activity } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useUI } from '../context/UIContext';
import Equalizer from './Equalizer';

const VinylPlayer: React.FC = () => {
    const { isPlaying, togglePlay, currentTrack } = usePlayer();
    const { setMusicPanelOpen } = useUI();
    const [viewMode, setViewMode] = useState<'vinyl' | 'equalizer'>('vinyl');

    const activeTrack = currentTrack || { title: "No tracks found", artist: "Subscribe to some!", cover: "gradient1", duration: "0:00" };

    return (
        <main className="player-viewport">
            <div className="top-search-nav">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Поиск музыки, артистов..." />
                
                <div className="view-mode-tabs">
                    <button className={viewMode === 'vinyl' ? 'active' : ''} onClick={() => setViewMode('vinyl')}>
                        <Disc size={16} />
                        <span>VINYL</span>
                    </button>
                    <button className={viewMode === 'equalizer' ? 'active' : ''} onClick={() => setViewMode('equalizer')}>
                        <Activity size={16} />
                        <span>EQUALIZER</span>
                    </button>
                </div>

                <button className="mini-panel-trigger" onClick={() => setMusicPanelOpen(true)}>
                    <MusicIcon size={18} />
                </button>
            </div>

            <div className="stage-area">
                {viewMode === 'vinyl' ? (
                    <div className="vinyl-mode-content">
                        <div 
                            className={`vinyl-wrapper ${isPlaying ? 'is-playing' : ''}`}
                            onClick={togglePlay}
                            style={{cursor: 'pointer'}}
                        >
                            <div className="vinyl-disk">
                                <div className="vinyl-grooves"></div>
                                <div className="vinyl-center-label">
                                    <div className={`album-art-wrap ${activeTrack.cover}`} style={{
                                        backgroundSize: 'cover',
                                        backgroundImage: activeTrack.cover.startsWith('http') ? `url(${activeTrack.cover})` : 'none'
                                    }} />
                                </div>
                            </div>
                            <div className="tonearm-assembly">
                                <div className="tonearm"><div className="stylus"></div></div>
                                <div className="tonearm-base"></div>
                            </div>
                        </div>
                        <div className="current-track-display">
                            <h2>{activeTrack.title}</h2>
                            <p>{activeTrack.artist}</p>
                        </div>
                    </div>
                ) : (
                    <div className="equalizer-mode-content">
                        <Equalizer />
                        <div className="current-track-display" style={{marginTop: 40}}>
                            <h2>{activeTrack.title}</h2>
                            <p>{activeTrack.artist}</p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .player-viewport { 
                    flex: 1; 
                    display: flex; 
                    flex-direction: column; 
                    padding: 24px; 
                    overflow-y: auto; 
                    min-width: 0; 
                }
                
                .top-search-nav { position: relative; margin-bottom: 40px; display: flex; align-items: center; gap: 16px; }
                .search-icon { position: absolute; left: 16px; color: #64748b; }
                .top-search-nav input { flex: 1; background: #0f0f12; border: 1px solid #1e293b; padding: 12px 12px 12px 48px; border-radius: 12px; color: white; outline: none; font-size: 14px; }
                
                .view-mode-tabs { display: flex; background: #0f0f12; border: 1px solid #1e293b; border-radius: 12px; padding: 4px; gap: 4px; }
                .view-mode-tabs button { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: none; color: #64748b; font-size: 11px; font-weight: 700; cursor: pointer; border-radius: 8px; transition: all 0.2s; }
                .view-mode-tabs button.active { background: #1e293b; color: white; }

                .mini-panel-trigger { background: #0f0f12; border: 1px solid #1e293b; color: #64748b; padding: 10px; border-radius: 12px; cursor: pointer; }

                .stage-area { flex: 1; display: flex; flex-direction: column; padding-bottom: 40px; min-height: 0; }
                .vinyl-mode-content, .equalizer-mode-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                
                .vinyl-wrapper { position: relative; width: 340px; height: 340px; }
                .vinyl-disk { width: 100%; height: 100%; background: #111; border-radius: 50%; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.8); animation: rotateDisk 3s linear infinite; animation-play-state: paused; border: 10px solid #181818; }
                .is-playing .vinyl-disk { animation-play-state: running; }
                .vinyl-grooves { position: absolute; inset: 12px; border-radius: 50%; background: repeating-radial-gradient(circle, #111, #111 2px, #181818 3px); opacity: 0.4; }
                .vinyl-center-label { position: absolute; inset: 34%; background: #333; border-radius: 50%; overflow: hidden; border: 5px solid #111; z-index: 2; }
                .album-art-wrap { width: 100%; height: 100%; }
                .tonearm-assembly { position: absolute; top: 20px; right: -30px; width: 200px; height: 220px; z-index: 10; pointer-events: none; transform-origin: bottom right; transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); transform: rotate(85deg); }
                .is-playing .tonearm-assembly { transform: rotate(58deg); }
                .tonearm { position: absolute; bottom: 0; right: 0; width: 190px; height: 8px; background: linear-gradient(to right, #94a3b8, #475569); border-radius: 4px; transform: rotate(-12deg); transform-origin: right center; }
                .stylus { position: absolute; left: -6px; top: -4px; width: 24px; height: 16px; background: #cbd5e1; border-radius: 2px; box-shadow: 0 4px 8px rgba(0,0,0,0.4); }
                .tonearm-base { position: absolute; bottom: -20px; right: -20px; width: 50px; height: 50px; background: #1e293b; border: 5px solid #334155; border-radius: 50%; box-shadow: 0 8px 16px rgba(0,0,0,0.6); }
                @keyframes rotateDisk { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .current-track-display { text-align: center; }
                .current-track-display h2 { font-size: 32px; font-weight: 800; margin-bottom: 8px; color: #f1f5f9; }
                .current-track-display p { font-size: 18px; color: #60a5fa; font-weight: 600; }
            `}</style>
        </main>
    );
};

export default VinylPlayer;
