import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { uploadToIPFS } from '../api/ipfs';

const MusicUpload: React.FC = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [cid, setCid] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setStatus('idle');
        
        try {
            const res = await uploadToIPFS(file);
            setCid(res.cid);
            setStatus('success');
            // Здесь в будущем будет вызов Nostr реле для публикации Kind 94
        } catch (err) {
            console.error('Upload failed:', err);
            setStatus('error');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="music-upload-container">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="audio/*" 
                style={{ display: 'none' }} 
            />
            
            <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                className={`upload-btn ${status}`}
            >
                {isUploading ? (
                    <Loader2 className="animate-spin" size={16} />
                ) : status === 'success' ? (
                    <CheckCircle2 size={16} />
                ) : status === 'error' ? (
                    <XCircle size={16} />
                ) : (
                    <Upload size={16} />
                )}
                <span>{isUploading ? 'ЗАГРУЗКА...' : status === 'success' ? 'ГОТОВО' : 'ЗАГРУЗИТЬ ТРЕК'}</span>
            </button>

            {cid && (
                <div className="cid-info">
                    CID: {cid.substring(0, 10)}...{cid.substring(cid.length - 4)}
                </div>
            )}

            <style>{`
                .music-upload-container {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 0.5px dashed #1e293b;
                }
                .upload-btn {
                    width: 100%;
                    height: 36px;
                    border-radius: 8px;
                    background: #1e293b;
                    border: 0.5px solid #334155;
                    color: #94a3b8;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .upload-btn:hover:not(:disabled) {
                    background: #334155;
                    color: #f1f5f9;
                    border-color: #60a5fa;
                }
                .upload-btn.success {
                    background: rgba(34, 197, 94, 0.1);
                    color: #4ade80;
                    border-color: #22c55e;
                }
                .upload-btn.error {
                    background: rgba(239, 68, 68, 0.1);
                    color: #f87171;
                    border-color: #ef4468;
                }
                .cid-info {
                    font-size: 8px;
                    color: #64748b;
                    margin-top: 8px;
                    text-align: center;
                    font-family: monospace;
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default MusicUpload;
