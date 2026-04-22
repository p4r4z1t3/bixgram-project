import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const BottomPlayer: React.FC = () => {
    const { isPlaying, togglePlay, nextTrack, prevTrack, currentTrack } = usePlayer();
    const [volume, setVolume] = useState(70);
    const [isMuted, setIsMuted] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    return (
        <div className="bottom-player-container">
            {/* 1. Кнопки управления (слева) */}
            <div className="controls-left">
                <button onClick={prevTrack} className="nav-btn"><SkipBack size={18} fill="currentColor" /></button>
                <button onClick={togglePlay} className="master-play-pause">
                    {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" style={{marginLeft: '2px'}} />}
                </button>
                <button onClick={nextTrack} className="nav-btn"><SkipForward size={18} fill="currentColor" /></button>
            </div>

            {/* 2. Прогресс-бар (центр) */}
            <div className="progress-center">
                <span className="time-label">0:00</span>
                <div className="seek-slider-track">
                    <div className="seek-slider-fill" style={{ width: isPlaying ? '15%' : '0%' }}></div>
                </div>
                <span className="time-label">{currentTrack?.duration || '0:00'}</span>
            </div>

            {/* 3. Громкость (справа) */}
            <div className="volume-right">
                <button 
                    className="volume-trigger" 
                    onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                {showVolumeSlider && (
                    <div className="volume-popover-horizontal">
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={isMuted ? 0 : volume} 
                            onChange={(e) => setVolume(Number(e.target.value))} 
                        />
                    </div>
                )}
            </div>

            <style>{`
                .bottom-player-container {
                    width: 100%;
                    height: 56px;
                    background: #0d0d10;
                    border-top: 0.5px solid #1e1e26;
                    display: flex;
                    align-items: center;
                    padding: 0 16px;
                    flex-shrink: 0;
                    z-index: 100;
                }

                .controls-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .nav-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    transition: color 0.2s;
                }
                .nav-btn:hover { color: white; }

                .master-play-pause {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: transparent;
                    border: 1px solid #334155;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .master-play-pause:hover { border-color: #60a5fa; color: #60a5fa; }

                .progress-center {
                    flex: 1;
                    margin: 0 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .time-label {
                    font-size: 11px;
                    color: #64748b;
                    font-family: monospace;
                    min-width: 35px;
                }

                .seek-slider-track {
                    flex: 1;
                    height: 3px;
                    background: #1e1e26;
                    border-radius: 2px;
                    position: relative;
                    cursor: pointer;
                }

                .seek-slider-fill {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    background: #3b82f6;
                    border-radius: 2px;
                }

                .volume-right {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .volume-trigger {
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }
                .volume-trigger:hover { color: white; }

                .volume-popover-horizontal {
                    position: absolute;
                    bottom: 60px;
                    right: 0;
                    width: 100px;
                    height: 32px;
                    background: #1a1a1f;
                    border: 0.5px solid #1e1e26;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 10px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                }

                .volume-popover-horizontal input {
                    width: 80px;
                    accent-color: #3b82f6;
                    cursor: pointer;
                    height: 4px;
                }
            `}</style>
        </div>
    );
};

export default BottomPlayer;
