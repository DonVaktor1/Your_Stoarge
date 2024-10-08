import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth"; 
import { auth } from "../../firebase"; 



export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                localStorage.setItem('user', JSON.stringify(user)); 
            } else {
                setCurrentUser(null);
                localStorage.removeItem('user');
            }
            setLoading(false);
        });

       
        return () => unsubscribe();
    }, []);

    const logout = () => {
      
        auth.signOut();
        setCurrentUser(null);
        localStorage.removeItem('user');
        navigate('/signin'); 
    };

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, loading, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
