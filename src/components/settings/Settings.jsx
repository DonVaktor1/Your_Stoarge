import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut, 
    deleteUser, 
    EmailAuthProvider, 
    reauthenticateWithCredential 
} from 'firebase/auth';
import { getDatabase, ref, remove } from 'firebase/database';
import './Settings.css'; 

const Settings = () => {
    const [user, setUser] = useState(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // Управление модальным окном
    const navigate = useNavigate();
    const auth = getAuth();

    // Отслеживание аутентификации
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

    // Логаут пользователя
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/signin');
        } catch (error) {
            console.error('Помилка при виході:', error);
        }
    };

    // Открытие модального окна
    const openModal = () => {
        setIsModalOpen(true);
    };

    // Закрытие модального окна
    const closeModal = () => {
        setIsModalOpen(false);
        setPassword('');
        setError('');
    };

    const handleCancel = () => {
        navigate('/main');
    };

    const handleDeleteAccount = async () => {
        const credential = EmailAuthProvider.credential(user.email, password);
        
        try {
            console.log("Початок процесу видалення акаунта...");
    
            // Повторна аутентифікація
            console.log("Повторна аутентифікація користувача...");
            await reauthenticateWithCredential(user, credential);
            console.log("Аутентифікація пройдена успішно.");
    
            // Видалення даних з Realtime Database
            console.log("Видалення даних з Realtime Database...");
            const db = getDatabase();
            const userRef = ref(db, `users/${user.uid}`);
            await remove(userRef);
            console.log('Дані користувача з Firebase Realtime Database видалено.');
    
            // Видалення користувача
            console.log("Видалення акаунта...");
            await deleteUser(user);
            console.log('Акаунт видалено.');
    
            navigate('/signup'); // Перенаправлення після видалення
    
        } catch (error) {
            console.error('Помилка при видаленні акаунта:', error);
    
            if (error.code === 'auth/wrong-password') {
                setError('Невірний пароль. Спробуйте ще раз.');
            } else if (error.code === 'storage/object-not-found') {
                setError('Не вдалося знайти файли користувача у Firebase Storage.');
            } else {
                setError('Сталася помилка при видаленні акаунта. Спробуйте ще раз пізніше.');
            }
        }
    };
    
    const handleConfirmDelete = (e) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы
        console.log("Підтвердження видалення акаунта...");
        handleDeleteAccount(); // Выполняем удаление аккаунта
    };
    

    return (
        <div className="settings-container">
            <div className="settings-content">
                <h1>Налаштування</h1>
                {user ? (
                    <>
                        <p>Ви увійшли як: {user.email}</p>
                        <div className="action-buttons">
                            <button onClick={handleCancel} className="cancel1-button">
                                Скасувати
                            </button>
                            <button onClick={openModal} className="delete-button">
                                Видалити акаунт
                            </button>
                            <button onClick={handleLogout} className="logout-button">
                                Вийти з акаунта
                            </button>
                        </div>
                    </>
                ) : (
                    <p>Завантаження користувача...</p>
                )}


                {isModalOpen && (
    <div className="modal">
        <div className="modal-content">
            <h2>Підтвердьте видалення акаунта</h2>
            <form onSubmit={handleConfirmDelete} className="modal-form">
                <input
                    type="password"
                    placeholder="Введіть ваш пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="password-input"
                    required
                />
                <div className="modal-buttons">
                    <button type="button" onClick={closeModal} className="cancel-button2">
                        Скасувати
                    </button>
                    <button type="submit" className="confirm-button">
                        Підтвердити
                    </button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    </div>
)}

            </div>
        </div>
    );
};

export default Settings;