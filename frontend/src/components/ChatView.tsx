import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, MoreVertical, Hash, Music as MusicIcon, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNostr } from '../context/NostrContext';
import { useUI } from '../context/UIContext';
import UserPanel from './UserPanel';

interface ChatMessage {
    id: string;
    pubkey: string;
    content: string;
    time: string;
    timestamp: number;
}

interface UserProfile {
    name?: string;
    display_name?: string;
    picture?: string;
}

const ChatView: React.FC = () => {
    const { pubkey, signEvent } = useAuth();
    const { relay } = useNostr();
    const { setMusicPanelOpen } = useUI();
    const [chats, setChats] = useState<ChatMessage[]>([]);
    const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Подписка на сообщения чата (Kind 1) и метаданные профилей (Kind 0)
    useEffect(() => {
        if (!relay) return;

        // Подписка на чат-сообщения
        const subChats = relay.subscribe([{ kinds: [1], limit: 100 }], (event: any) => {
            const msg: ChatMessage = {
                id: event.id,
                pubkey: event.pubkey,
                content: event.content,
                timestamp: event.created_at,
                time: new Date(event.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setChats(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg].sort((a, b) => a.timestamp - b.timestamp);
            });
        });

        // Подписка на профили авторов (Kind 0)
        const subProfiles = relay.subscribe([{ kinds: [0], limit: 100 }], (event: any) => {
            try {
                const meta = JSON.parse(event.content);
                setProfiles(prev => ({
                    ...prev,
                    [event.pubkey]: {
                        name: meta.name || '',
                        display_name: meta.display_name || '',
                        picture: meta.picture || '',
                    }
                }));
            } catch (e) {
                // Ignore parse errors
            }
        });

        return () => {
            relay.unsubscribe(subChats);
            relay.unsubscribe(subProfiles);
        };
    }, [relay]);

    // Автоскролл к последнему сообщению
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats]);

    const handleSendMessage = async () => {
        const trimmed = message.trim();
        if (!trimmed || !relay || !pubkey || isSending) return;

        setIsSending(true);
        try {
            const eventTemplate = {
                kind: 1,
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: trimmed,
                pubkey: pubkey
            };

            const signedEvent = await signEvent(eventTemplate);
            await relay.publish(signedEvent);
            setMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getDisplayName = (authorPubkey: string) => {
        const p = profiles[authorPubkey];
        if (p?.display_name) return p.display_name;
        if (p?.name) return `@${p.name}`;
        if (authorPubkey === pubkey) return 'Вы';
        return `${authorPubkey.slice(0, 8)}...`;
    };

    return (
        <div className="chat-view-container">
            {/* Боковая панель чатов */}
            <aside className="chat-sidebar">
                <div className="sidebar-header">
                    <MessageSquare size={18} />
                    <span>CHATS</span>
                </div>
                <div className="sidebar-list">
                    <div className="sidebar-item active">
                        <div className="channel-hash">#</div>
                        <div className="item-meta">
                            <div className="name">general-chat</div>
                            <div className="last-msg">
                                {chats.length > 0 ? chats[chats.length - 1].content.slice(0, 20) : 'Нет сообщений'}
                            </div>
                        </div>
                    </div>
                </div>
                <UserPanel />
            </aside>

            {/* Основная область сообщений */}
            <main className="chat-main">
                <header className="chat-top-bar">
                    <div className="channel-info">
                        <Hash size={20} className="hash-icon" />
                        <span className="channel-name">general-chat</span>
                        <span className="online-badge">{chats.length} msg</span>
                    </div>
                    <div className="top-actions">
                        <button onClick={() => setMusicPanelOpen(true)} className="action-btn" title="Music Player">
                            <MusicIcon size={18} />
                        </button>
                        <MoreVertical size={20} />
                    </div>
                </header>

                <div className="messages-area">
                    {chats.length === 0 ? (
                        <div className="empty-chat">
                            <Hash size={40} className="empty-icon" />
                            <h4>Добро пожаловать в #general-chat!</h4>
                            <p>Это начало зашифрованного Nostr-пространства. Напишите первое сообщение!</p>
                        </div>
                    ) : (
                        chats.map(msg => {
                            const isMe = msg.pubkey === pubkey;
                            const profile = profiles[msg.pubkey];
                            return (
                                <div key={msg.id} className={`message-row ${isMe ? 'my-message' : ''}`}>
                                    <div className="msg-avatar">
                                        {profile?.picture ? (
                                            <img src={profile.picture} alt="Avatar" />
                                        ) : (
                                            <div className="avatar-letter">
                                                {getDisplayName(msg.pubkey).charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="msg-content">
                                        <div className="msg-header">
                                            <span className={`msg-author ${isMe ? 'is-me' : ''}`}>
                                                {getDisplayName(msg.pubkey)}
                                            </span>
                                            <span className="msg-time">{msg.time}</span>
                                        </div>
                                        <div className="msg-body">{msg.content}</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="input-area">
                    <div className="input-wrapper">
                        <input 
                            type="text" 
                            placeholder="Написать в #general-chat... (Enter для отправки)" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={!relay}
                        />
                        <button 
                            className={`send-btn ${message.trim() ? 'active' : ''}`}
                            onClick={handleSendMessage}
                            disabled={!message.trim() || isSending}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </main>

            <style>{`
                .chat-view-container { display: flex; flex: 1; height: 100%; overflow: hidden; background: #0f0f12; }
                .chat-sidebar { width: 240px; background: #121214; border-right: 1px solid #1e293b; display: flex; flex-direction: column; }
                .sidebar-header { padding: 16px; font-size: 12px; font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #1e293b; }
                .sidebar-list { flex: 1; overflow-y: auto; padding: 8px; }
                .sidebar-item { padding: 10px 12px; display: flex; align-items: center; gap: 10px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
                .sidebar-item:hover { background: rgba(255,255,255,0.05); }
                .sidebar-item.active { background: rgba(124, 77, 212, 0.15); border: 1px solid rgba(124, 77, 212, 0.3); }
                .channel-hash { width: 32px; height: 32px; background: #1e293b; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-weight: bold; font-size: 16px; }
                .item-meta .name { font-size: 13px; font-weight: 600; color: #f1f5f9; }
                .item-meta .last-msg { font-size: 11px; color: #64748b; margin-top: 2px; }

                .chat-main { flex: 1; display: flex; flex-direction: column; background: #0b0b0e; }
                .chat-top-bar { height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #1e293b; background: #0f0f12; }
                .channel-info { display: flex; align-items: center; gap: 8px; }
                .hash-icon { color: #7c4dd4; }
                .channel-name { font-weight: 700; color: #f1f5f9; font-size: 15px; }
                .online-badge { font-size: 11px; background: #1e293b; color: #94a3b8; padding: 2px 8px; border-radius: 12px; }
                .top-actions { display: flex; align-items: center; gap: 12px; color: #64748b; }
                .action-btn { background: none; border: none; color: inherit; cursor: pointer; display: flex; align-items: center; transition: color 0.2s; padding: 6px; border-radius: 6px; }
                .action-btn:hover { color: #f1f5f9; background: rgba(255,255,255,0.05); }
                
                .messages-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
                .empty-chat { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #64748b; text-align: center; gap: 10px; }
                .empty-icon { color: #7c4dd4; opacity: 0.5; }
                .empty-chat h4 { color: #f1f5f9; font-size: 16px; margin: 0; }
                .empty-chat p { font-size: 13px; max-width: 320px; margin: 0; }

                .message-row { display: flex; gap: 12px; align-items: flex-start; }
                .msg-avatar { width: 38px; height: 38px; border-radius: 50%; overflow: hidden; background: #1e293b; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid #334155; }
                .msg-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .avatar-letter { font-size: 14px; font-weight: 700; color: #a78bfa; }
                .msg-content { display: flex; flex-direction: column; max-width: 80%; }
                .msg-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 2px; }
                .msg-author { font-size: 13px; font-weight: 700; color: #f1f5f9; }
                .msg-author.is-me { color: #a78bfa; }
                .msg-time { font-size: 10px; color: #64748b; }
                .msg-body { font-size: 14px; color: #cbd5e1; line-height: 1.5; word-break: break-word; background: #15151c; padding: 8px 14px; border-radius: 4px 12px 12px 12px; border: 1px solid #1e293b; }
                .my-message .msg-body { background: #1a1626; border-color: rgba(124, 77, 212, 0.3); }

                .input-area { padding: 0 20px 20px; }
                .input-wrapper { background: #16161d; border: 1px solid #1e293b; border-radius: 10px; display: flex; align-items: center; padding: 4px 8px 4px 16px; transition: border-color 0.2s; }
                .input-wrapper:focus-within { border-color: #7c4dd4; }
                .input-wrapper input { flex: 1; background: none; border: none; padding: 10px 0; color: white; outline: none; font-size: 14px; }
                .send-btn { background: none; border: none; color: #475569; cursor: pointer; padding: 8px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .send-btn.active { color: #a78bfa; background: rgba(124, 77, 212, 0.15); cursor: pointer; }
                .send-btn:disabled { cursor: not-allowed; opacity: 0.5; }
            `}</style>
        </div>
    );
};

export default ChatView;
