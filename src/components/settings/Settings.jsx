import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import './Settings.css'; 

const Settings = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                navigate('/signin');
            }
        });

        return () => unsubscribe();
    }, [auth, navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/signin');
        } catch (error) {
            console.error('Помилка при виході:', error);
        }
    };

    if (!user) return <p>Завантаження...</p>;

    return (
        <div className="settings-container">
            <div className="settings-content">
                <h1>Налаштування</h1>
                <p>Ви увійшли як: {user.email}</p>
                <button onClick={handleLogout}>Вийти з акаунта</button>
            </div>
        </div>
    );
};

export default Settings;
