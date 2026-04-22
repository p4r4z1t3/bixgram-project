import React, { createContext, useContext, useEffect, useRef } from 'react';
import NostrRelay from '../api/relay';
import { useAuth } from './AuthContext';

const NostrContext = createContext<any>(null);

export const NostrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { pubkey, signEvent } = useAuth();
    const relay = useRef<NostrRelay | null>(null);

    useEffect(() => {
        if (!relay.current) {
            relay.current = new NostrRelay('ws://localhost:8080/ws', (msg) => {
                const [type, payload] = msg;
                
                if (type === 'AUTH') {
                    const challenge = payload;
                    console.log('Received AUTH challenge:', challenge);
                    
                    if (!pubkey) {
                        console.log('No identity available, skipping AUTH');
                        return;
                    }
                    
                    try {
                        const authEvent = signEvent({
                            kind: 22242,
                            created_at: Math.floor(Date.now() / 1000),
                            tags: [
                                ['challenge', challenge],
                                ['relay', 'ws://localhost:8080/ws']
                            ],
                            content: 'Authenticate with BIXGRAM Relay'
                        });

                        relay.current?.send(['AUTH', authEvent]);
                        console.log('AUTH event sent to relay');
                    } catch (e) {
                        console.error('Failed to sign auth event:', e);
                    }
                }
            });
            relay.current.connect();
        }
    }, [pubkey, signEvent]);

    return (
        <NostrContext.Provider value={{ relay: relay.current }}>
            {children}
        </NostrContext.Provider>
    );
};

export const useNostr = () => useContext(NostrContext);
