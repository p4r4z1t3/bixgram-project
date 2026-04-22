import React, { useState, useRef } from 'react';
import { X, Upload, FileAudio, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNostr } from '../context/NostrContext';
import { usePlayer } from '../context/PlayerContext';
import type { Track } from '../context/PlayerContext';
import { uploadToIPFS } from '../api/ipfs';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
    const { pubkey, signEvent } = useAuth();
    const { relay } = useNostr();
    const { addTrack } = usePlayer();
    const [step, setStep] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [cover, setCover] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    
    const [metadata, setMetadata] = useState({
        title: '',
        artist: pubkey?.slice(0, 8) || 'Anonymous',
        album: '',
        genre: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (selectedFile: File) => {
        if (selectedFile.type.startsWith('audio/')) {
            setFile(selectedFile);
            setMetadata(prev => ({ ...prev, title: selectedFile.name.replace(/\.[^/.]+$/, "") }));
            setStep(2);
        }
    };

    const handleCoverSelect = (selectedFile: File) => {
        if (selectedFile.type.startsWith('image/')) {
            setCover(selectedFile);
            setCoverPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file || !pubkey) return;

        setStep(3);
        try {
            // 1. Подготовка
            setStatusText('Подготовка файла...');
            setUploadProgress(15);
            await new Promise(r => setTimeout(r, 800));

            // 2. Загрузка в IPFS
            setStatusText('Загрузка на IPFS...');
            setUploadProgress(40);
            const res = await uploadToIPFS(file);
            setUploadProgress(80);

            // 3. Создание Nostr события
            setStatusText('Создание Nostr события...');
            const event = {
                kind: 1069,
                content: JSON.stringify({
                    title: metadata.title,
                    artist: metadata.artist,
                    album: metadata.album,
                    genre: metadata.genre,
                    cid: res.cid
                }),
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ["t", metadata.genre],
                    ["ipfs", res.cid]
                ],
                pubkey: pubkey
            };

            const signedEvent = await signEvent(event);
            console.log('Sending Nostr event:', signedEvent);
            
            if (relay) {
                await relay.publish(signedEvent);
                console.log('Event published to relay');
            }

            // Optimistic UI update
            const newTrack: Track = {
                id: signedEvent.id,
                title: metadata.title,
                artist: metadata.artist,
                cover: 'gradient1',
                duration: '3:45',
                url: `http://localhost:8080/ipfs/${res.cid}`,
                cid: res.cid
            };
            addTrack(newTrack);
            console.log('Track added to local playlist:', newTrack);

            setUploadProgress(100);
            setStatusText('Готово! ✓');

            setTimeout(() => {
                onUploadSuccess();
                onClose();
                // Сброс состояния
                setStep(1);
                setFile(null);
                setUploadProgress(0);
            }, 1500);

        } catch (err) {
            console.error('Upload failed:', err);
            setStatusText('Ошибка загрузки');
            setStep(2);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="upload-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Загрузить трек</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-content">
                    {step === 1 && (
                        <div 
                            className={`drop-zone ${isDragging ? 'active' : ''}`}
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) handleFileSelect(f); }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} accept=".mp3,.wav,.flac,.aiff" hidden />
                            <Upload size={48} className="upload-icon" />
                            <p className="main-text">Перетащи аудио файл сюда</p>
                            <p className="sub-text">MP3, WAV, FLAC · до 4GB</p>
                            <button className="select-btn">Выбрать файл</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="metadata-form">
                            <div className="file-preview">
                                <FileAudio size={24} color="#7c4dd4" />
                                <div className="file-info">
                                    <div className="file-name">{file?.name}</div>
                                    <div className="file-size">{(file!.size / (1024*1024)).toFixed(2)} MB</div>
                                </div>
                            </div>

                            <div className="form-layout">
                                <div className="form-fields">
                                    <div className="input-group">
                                        <label>Название *</label>
                                        <input type="text" value={metadata.title} onChange={e => setMetadata({...metadata, title: e.target.value})} placeholder="Название трека" />
                                    </div>
                                    <div className="input-group">
                                        <label>Артист *</label>
                                        <input type="text" value={metadata.artist} onChange={e => setMetadata({...metadata, artist: e.target.value})} placeholder="Имя исполнителя" />
                                    </div>
                                    <div className="row">
                                        <div className="input-group">
                                            <label>Альбом</label>
                                            <input type="text" value={metadata.album} onChange={e => setMetadata({...metadata, album: e.target.value})} placeholder="Название альбома" />
                                        </div>
                                        <div className="input-group">
                                            <label>Жанр</label>
                                            <input type="text" value={metadata.genre} onChange={e => setMetadata({...metadata, genre: e.target.value})} placeholder="Жанр" />
                                        </div>
                                    </div>
                                </div>

                                <div className="cover-upload" onClick={() => coverInputRef.current?.click()}>
                                    <input type="file" ref={coverInputRef} onChange={e => e.target.files?.[0] && handleCoverSelect(e.target.files[0])} accept="image/*" hidden />
                                    {coverPreview ? <img src={coverPreview} alt="cover" /> : (
                                        <div className="cover-placeholder">
                                            <ImageIcon size={24} />
                                            <span>Обложка</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button className="back-btn" onClick={() => setStep(1)}>Назад</button>
                                <button className="submit-btn" disabled={!metadata.title || !metadata.artist} onClick={handleUpload}>Загрузить →</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="upload-progress-container">
                            <div className="progress-status">
                                {uploadProgress < 100 ? <Loader2 size={32} className="spinner" /> : <CheckCircle2 size={32} color="#22c55e" />}
                                <h4>{statusText}</h4>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <div className="percentage">{uploadProgress}%</div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
                .upload-modal { width: 560px; background: #121217; border: 1px solid #2a2a38; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .modal-header { padding: 16px 20px; border-bottom: 1px solid #1a1a22; display: flex; align-items: center; justify-content: space-between; }
                .modal-header h3 { font-size: 16px; font-weight: 700; color: #e0e0f0; }
                .close-btn { background: none; border: none; color: #444458; cursor: pointer; transition: color 0.2s; }
                .close-btn:hover { color: white; }
                
                .modal-content { padding: 24px; }
                
                .drop-zone { border: 2px dashed #2a2a38; border-radius: 12px; padding: 40px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all 0.2s; }
                .drop-zone:hover, .drop-zone.active { border-color: #7c4dd4; background: rgba(124, 77, 212, 0.05); }
                .upload-icon { color: #444458; margin-bottom: 16px; }
                .drop-zone:hover .upload-icon { color: #7c4dd4; }
                .main-text { font-size: 15px; font-weight: 600; color: #e0e0f0; margin-bottom: 4px; }
                .sub-text { font-size: 12px; color: #444458; margin-bottom: 24px; }
                .select-btn { background: #7c4dd4; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
                
                .file-preview { display: flex; align-items: center; gap: 12px; padding: 12px; background: #0a0a0f; border-radius: 8px; margin-bottom: 24px; }
                .file-name { font-size: 13px; font-weight: 600; color: #e0e0f0; }
                .file-size { font-size: 11px; color: #444458; }
                
                .form-layout { display: flex; gap: 24px; margin-bottom: 32px; }
                .form-fields { flex: 1; display: flex; flex-direction: column; gap: 16px; }
                .input-group { display: flex; flex-direction: column; gap: 6px; }
                .input-group label { font-size: 11px; font-weight: 700; color: #444458; text-transform: uppercase; letter-spacing: 0.5px; }
                .input-group input { background: #0a0a0f; border: 1px solid #2a2a38; border-radius: 6px; padding: 10px 12px; color: white; outline: none; font-size: 14px; }
                .input-group input:focus { border-color: #7c4dd4; }
                .row { display: flex; gap: 12px; }
                .row .input-group { flex: 1; }
                
                .cover-upload { width: 120px; height: 120px; border: 1px dashed #2a2a38; border-radius: 8px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; background: #0a0a0f; }
                .cover-upload img { width: 100%; height: 100%; object-fit: cover; }
                .cover-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #444458; font-size: 11px; }
                
                .form-actions { display: flex; justify-content: flex-end; gap: 12px; }
                .back-btn { background: none; border: none; color: #444458; font-weight: 600; cursor: pointer; }
                .submit-btn { background: #7c4dd4; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
                .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .upload-progress-container { display: flex; flex-direction: column; align-items: center; padding: 40px 0; }
                .progress-status { display: flex; flex-direction: column; align-items: center; gap: 16px; margin-bottom: 24px; }
                .spinner { animation: rotate 1s linear infinite; color: #7c4dd4; }
                .progress-bar-bg { width: 100%; height: 8px; background: #0a0a0f; border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
                .progress-bar-fill { height: 100%; background: #7c4dd4; transition: width 0.3s ease; }
                .percentage { font-size: 12px; color: #444458; font-weight: 700; }
                
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default UploadModal;
