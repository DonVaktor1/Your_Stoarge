import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useState } from "react";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../auth/AuthContext';
import './SignIn.css'; 

const SignIn = () => {
    const { setCurrentUser } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const login = async (e) => {
        e.preventDefault();
    
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User logged in:", user);
            setCurrentUser(user); // Оновлюємо поточного користувача в контексті
            setError("");
            setEmail("");
            setPassword("");
            navigate("/main"); // Перенаправляємо на основну сторінку
        } catch (error) {
            console.error("Login error:", error);
            setError("Акаунт не знайдено!");
        }
    };
    

    return (
        <div className="signin-background"> {/* Додаємо контейнер фону */}
            <div className="signin-container">
                <form className="signin-form" onSubmit={login}>
                    <h2>Вхід в акаунт</h2>
                    <input
                        className="signin-input"
                        placeholder="Пошта"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                    />
                    <input
                        className="signin-input"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                    />
                    <button className="signin-button" type="submit">Увійти</button>
                    {error && <p className="error-message">{error}</p>}
                    <p className="signup-prompt">Немає акаунту? <a href="/signup">Зареєструватись</a></p>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
