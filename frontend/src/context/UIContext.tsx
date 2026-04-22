import React, { createContext, useContext, useState } from 'react';

type AppMode = 'music' | 'chat';

interface UIContextType {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
    isMusicPanelOpen: boolean;
    setMusicPanelOpen: (open: boolean) => void;
    isPlayerExpanded: boolean;
    setPlayerExpanded: (expanded: boolean) => void;
    isSettingsOpen: boolean;
    setSettingsOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<AppMode>('music');
    const [isMusicPanelOpen, setMusicPanelOpen] = useState(false);
    const [isPlayerExpanded, setPlayerExpanded] = useState(false);
    const [isSettingsOpen, setSettingsOpen] = useState(false);

    return (
        <UIContext.Provider value={{ 
            mode, setMode, 
            isMusicPanelOpen, setMusicPanelOpen, 
            isPlayerExpanded, setPlayerExpanded,
            isSettingsOpen, setSettingsOpen
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within a UIProvider');
    return context;
};
