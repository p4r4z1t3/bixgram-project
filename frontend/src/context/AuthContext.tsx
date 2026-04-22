import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPublicKey, finalizeEvent } from 'nostr-tools';

interface AuthContextType {
    pubkey: string | null;
    privkey: string | null;
    loading: boolean;
    login: (privkeyHex: string) => void;
    logout: () => void;
    signEvent: (eventTemplate: any) => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Вспомогательная функция для перевода hex в Uint8Array (без внешних зависимостей)
const hexToBytes = (hex: string): Uint8Array => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, (i * 2) + 2), 16);
    }
    return bytes;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pubkey, setPubkey] = useState<string | null>(null);
    const [privkey, setPrivkey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const login = (privkeyHex: string) => {
        try {
            const privBytes = hexToBytes(privkeyHex);
            const pub = getPublicKey(privBytes);
            localStorage.setItem('privkey', privkeyHex);
            localStorage.setItem('pubkey', pub);
            setPrivkey(privkeyHex);
            setPubkey(pub);
        } catch (e) {
            console.error('Login error:', e);
            throw new Error('Invalid key');
        }
    };

    const signEvent = (eventTemplate: any) => {
        if (!privkey) throw new Error('No private key available for signing');
        return finalizeEvent(eventTemplate, hexToBytes(privkey));
    };

    const logout = () => {
        localStorage.removeItem('privkey');
        localStorage.removeItem('pubkey');
        setPrivkey(null);
        setPubkey(null);
    };

    useEffect(() => {
        const storedPriv = localStorage.getItem('privkey');
        const storedPub = localStorage.getItem('pubkey');
        if (storedPriv && storedPub) {
            setPrivkey(storedPriv);
            setPubkey(storedPub);
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ pubkey, privkey, loading, login, logout, signEvent }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
