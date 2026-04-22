import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, MoreVertical, Hash, Music as MusicIcon } from 'lucide-react';
import { useNostr } from '../context/NostrContext';
import { useUI } from '../context/UIContext';
import UserPanel from './UserPanel';

interface ChatMessage {
    id: string;
    pubkey: string;
    content: string;
    time: string;
}

const ChatView: React.FC = () => {
    const { relay } = useNostr();
    const { setMusicPanelOpen } = useUI();
    const [chats, setChats] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!relay) return;

        const subChats = relay.subscribe([{ kinds: [1], limit: 50 }], (event: any) => {
            const msg: ChatMessage = {
                id: event.id,
                pubkey: event.pubkey,
                content: event.content,
                time: new Date(event.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setChats(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg].sort((a, b) => a.id > b.id ? 1 : -1);
            });
        });

        return () => relay.unsubscribe(subChats);
    }, [relay]);

    return (
        <div className="chat-view-container">
            {/* Sidebar with Chats */}
            <aside className="chat-sidebar">
                <div className="sidebar-header">
                    <MessageSquare size={18} />
                    <span>CHATS</span>
                </div>
                <div className="sidebar-list">
                    {chats.slice(0, 10).map(c => (
                        <div key={c.id} className="sidebar-item">
                            <div className="avatar-placeholder"></div>
                            <div className="item-meta">
                                <div className="name">{c.pubkey.slice(0, 8)}...</div>
                                <div className="last-msg">{c.content.slice(0, 20)}...</div>
                            </div>
                        </div>
                    ))}
                </div>
                <UserPanel />
            </aside>

            {/* Main Chat Area */}
            <main className="chat-main">
                <header className="chat-top-bar">
                    <div className="channel-info">
                        <Hash size={20} className="hash-icon" />
                        <span className="channel-name">general-chat</span>
                    </div>
                    <div className="top-actions">
                        <button onClick={() => setMusicPanelOpen(true)} className="action-btn">
                            <MusicIcon size={18} />
                        </button>
                        <MoreVertical size={20} />
                    </div>
                </header>

                <div className="messages-area">
                    {chats.map(msg => (
                        <div key={msg.id} className="message-row">
                            <div className="msg-avatar"></div>
                            <div className="msg-content">
                                <div className="msg-header">
                                    <span className="msg-author">{msg.pubkey.slice(0, 8)}</span>
                                    <span className="msg-time">{msg.time}</span>
                                </div>
                                <div className="msg-body">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="input-area">
                    <div className="input-wrapper">
                        <input 
                            type="text" 
                            placeholder="Message #general-chat" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button className="send-btn"><Send size={18} /></button>
                    </div>
                </div>
            </main>

            <style>{`
                .chat-view-container { display: flex; flex: 1; height: 100%; overflow: hidden; background: #0f0f12; }
                .chat-sidebar { width: 240px; background: #121214; border-right: 1px solid #1e293b; display: flex; flex-direction: column; }
                .sidebar-header { padding: 16px; font-size: 12px; font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #1e293b; }
                .sidebar-list { flex: 1; overflow-y: auto; }
                .sidebar-item { padding: 10px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
                .sidebar-item:hover { background: rgba(255,255,255,0.05); }
                .avatar-placeholder { width: 32px; height: 32px; background: #334155; border-radius: 50%; }
                .item-meta .name { font-size: 13px; font-weight: 600; color: #f1f5f9; }
                .item-meta .last-msg { font-size: 11px; color: #64748b; }

                .chat-top-bar { height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #1e293b; background: #0f0f12; }
                .top-actions { display: flex; align-items: center; gap: 12px; color: #64748b; }
                .action-btn { background: none; border: none; color: inherit; cursor: pointer; display: flex; align-items: center; transition: color 0.2s; }
                .action-btn:hover { color: #f1f5f9; }
                .hash-icon { color: #64748b; }
                .channel-name { font-weight: 700; color: #f1f5f9; }
                
                .messages-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
                .message-row { display: flex; gap: 12px; }
                .msg-avatar { width: 40px; height: 40px; background: #1e293b; border-radius: 50%; flex-shrink: 0; }
                .msg-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 2px; }
                .msg-author { font-size: 14px; font-weight: 700; color: #f1f5f9; }
                .msg-time { font-size: 10px; color: #64748b; }
                .msg-body { font-size: 14px; color: #cbd5e1; line-height: 1.4; }

                .input-area { padding: 0 20px 20px; }
                .input-wrapper { background: #1e293b; border-radius: 8px; display: flex; align-items: center; padding: 0 16px; }
                .input-wrapper input { flex: 1; background: none; border: none; padding: 12px 0; color: white; outline: none; font-size: 14px; }
                .send-btn { background: none; border: none; color: #64748b; cursor: pointer; }
            `}</style>
        </div>
    );
};

export default ChatView;
