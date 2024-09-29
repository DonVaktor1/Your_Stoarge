import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth"; // Додаємо Firebase перевірку стану авторизації
import { auth } from "../../firebase"; // Імпорт firebase конфігурації

// Створюємо контекст авторизації
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Використовуємо Firebase метод для перевірки стану авторизації
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                localStorage.setItem('user', JSON.stringify(user)); // Зберігаємо користувача в localStorage
            } else {
                setCurrentUser(null);
                localStorage.removeItem('user');
            }
            setLoading(false);
        });

        // Повертаємо функцію для очищення підписки на оновлення
        return () => unsubscribe();
    }, []);

    const logout = () => {
        // Очищення даних користувача та вихід з Firebase
        auth.signOut();
        setCurrentUser(null);
        localStorage.removeItem('user');
        navigate('/signin'); // Перенаправляємо на сторінку входу
    };

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, loading, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
