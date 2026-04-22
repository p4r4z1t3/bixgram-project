import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNostr } from './NostrContext';

export interface Track {
    id: string;
    title: string;
    artist: string;
    cover: string;
    duration: string;
    url: string;
    cid?: string;
}

interface PlayerContextType {
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    currentTrackIndex: number;
    setCurrentTrackIndex: (index: number) => void;
    playlist: Track[];
    currentTrack: Track | null;
    togglePlay: () => void;
    nextTrack: () => void;
    prevTrack: () => void;
    addTrack: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const IPFS_GATEWAY = "http://localhost:8080/ipfs/";

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { relay } = useNostr();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const [playlist, setPlaylist] = useState<Track[]>([]);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const addTrack = (track: Track) => {
        setPlaylist(prev => {
            if (prev.find(t => t.id === track.id)) return prev;
            return [track, ...prev];
        });
    };

    useEffect(() => {
        if (!relay) return;

        const subTracks = relay.subscribe([{ kinds: [94, 1069] }], (event: any) => {
            let track: Track;
            
            if (event.kind === 1069) {
                try {
                    const content = JSON.parse(event.content);
                    track = {
                        id: event.id,
                        title: content.title || 'Untitled',
                        artist: content.artist || 'Anonymous',
                        cover: 'gradient1',
                        duration: '3:45',
                        url: `${IPFS_GATEWAY}${content.cid}`,
                        cid: content.cid
                    };
                } catch (e) { return; }
            } else {
                track = {
                    id: event.id,
                    title: event.tags.find((t: any) => t[0] === 'title')?.[1] || 'Unknown',
                    artist: event.tags.find((t: any) => t[0] === 'artist')?.[1] || 'Unknown Artist',
                    cover: event.tags.find((t: any) => t[0] === 'cover')?.[1] || 'gradient1',
                    duration: event.tags.find((t: any) => t[0] === 'duration')?.[1] || '0:00',
                    url: event.tags.find((t: any) => t[0] === 'url')?.[1] || '',
                };
            }

            setPlaylist(prev => {
                if (prev.find(t => t.id === track.id)) return prev;
                return [...prev, track];
            });
        });

        return () => relay.unsubscribe(subTracks);
    }, [relay]);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.onended = () => nextTrack();
        }

        const audio = audioRef.current;
        const track = playlist[currentTrackIndex];

        if (track) {
            if (audio.src !== track.url) {
                audio.src = track.url;
                if (isPlaying) audio.play().catch(console.error);
            }
        }
    }, [currentTrackIndex, playlist]);

    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.play().catch(e => {
                console.error("Playback failed:", e);
                setIsPlaying(false);
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    const currentTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;

    const togglePlay = () => {
        if (currentTrackIndex === -1 && playlist.length > 0) {
            setCurrentTrackIndex(0);
        }
        setIsPlaying(!isPlaying);
    };

    const nextTrack = () => {
        if (playlist.length === 0) return;
        setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    };

    const prevTrack = () => {
        if (playlist.length === 0) return;
        setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    };

    return (
        <PlayerContext.Provider value={{ 
            isPlaying, setIsPlaying, currentTrackIndex, setCurrentTrackIndex, 
            playlist, currentTrack, togglePlay, nextTrack, prevTrack, addTrack
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
    return context;
};
