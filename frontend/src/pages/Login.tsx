import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldAlert, Key } from 'lucide-react';

const Login: React.FC = () => {
    const [nsec, setNsec] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const trimmed = nsec.trim();
            if (!trimmed.startsWith('nsec1')) {
                throw new Error('Key must start with "nsec1"');
            }

            const decoded = nip19.decode(trimmed);
            if (decoded.type !== 'nsec') {
                throw new Error('Invalid nsec key');
            }
            
            // Используем hex из nostr-tools, если доступно, иначе примитив
            const privKeyBytes = decoded.data as Uint8Array;
            const hexKey = Array.from(privKeyBytes)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            
            console.log('Login hex key:', hexKey);
            login(hexKey);
            navigate('/');
        } catch (err: any) {
            console.error('CRITICAL LOGIN ERROR:', err);
            setError(`Error: ${err.message}. Make sure you enter a valid nsec1... key.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="icon-badge">
                        <LogIn size={32} />
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Enter your secret key to continue</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="nsec">Secret Key (nsec)</label>
                        <div className="input-with-icon">
                            <Key size={20} />
                            <input
                                id="nsec"
                                type="password"
                                value={nsec}
                                onChange={(e) => setNsec(e.target.value)}
                                placeholder="nsec1..."
                                required
                            />
                        </div>
                    </div>

                    <div className="warning-box login-warning">
                        <ShieldAlert size={18} />
                        <span>Never share your secret key!</span>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Decrypting...' : 'Log In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>New to BIXGRAM? <Link to="/register">Create Identity</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
