import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, MapPin, Calendar } from 'lucide-react';

const Home: React.FC = () => {
    const { user, logout } = useAuth();

    if (!user) {
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
                    <h1>@{user.username}</h1>
                    <p className="bio">{user.bio || 'No bio yet...'}</p>
                </div>

                <div className="profile-details">
                    <div className="detail-item">
                        <MapPin size={20} />
                        <span>{user.location || 'Unknown location'}</span>
                    </div>
                    <div className="detail-item">
                        <Calendar size={20} />
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
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
