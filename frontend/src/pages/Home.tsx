import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Home: React.FC = () => {
    const { pubkey, logout } = useAuth();

    if (!pubkey) {
        return (
            <div className="welcome-container">
                <h1>Welcome to BIXGRAM</h1>
                <p>Please log in to see your profile</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <User size={64} />
                    </div>
                    <h1>Identity: {pubkey.slice(0, 16)}...</h1>
                </div>

                <button onClick={logout} className="logout-button">
                    <LogOut size={20} />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default Home;
