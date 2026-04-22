import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { useAuth } from '../context/AuthContext';
import { Key, ShieldCheck, Copy, Check } from 'lucide-react';

const Register: React.FC = () => {
    const [step, setStep] = useState(1);
    const [nsec, setNsec] = useState('');
    const [npub, setNpub] = useState('');
    const [copied, setCopied] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const bytesToHex = (bytes: Uint8Array) => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const generateKeys = () => {
        const sk = generateSecretKey();
        const pk = getPublicKey(sk);
        setNsec(nip19.nsecEncode(sk));
        setNpub(nip19.npubEncode(pk));
        setStep(2);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFinish = () => {
        try {
            const decoded = nip19.decode(nsec);
            if (decoded.type !== 'nsec') throw new Error('Not nsec');
            const hexKey = bytesToHex(decoded.data as Uint8Array);
            login(hexKey);
            navigate('/');
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="icon-badge"><Key size={32} /></div>
                    <h1>Create Identity</h1>
                </div>
                {step === 1 ? (
                    <button onClick={generateKeys} className="auth-button">Generate Keys</button>
                ) : (
                    <div className="auth-step-2">
                        <div className="warning-box"><ShieldCheck size={20} /><span>Save your key!</span></div>
                        <div className="key-box"><label>npub</label><div className="key-display"><code>{npub.slice(0, 16)}...</code></div></div>
                        <div className="key-box secret"><label>nsec</label><div className="key-display secret-display"><code>{nsec}</code><button onClick={() => copyToClipboard(nsec)} className="copy-btn">{copied ? <Check size={16} /> : <Copy size={16} />}</button></div></div>
                        <button onClick={handleFinish} className="auth-button">I Saved It, Let's Go</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
