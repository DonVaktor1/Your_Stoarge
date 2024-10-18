import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useState } from "react";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../auth/AuthContext';
import './SignUp.css';

const SignUp = () => {
    const { setCurrentUser } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [copypassword, setCopyPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const register = async (e) => {
        e.preventDefault(); 
        if (password !== copypassword) {
            setError("Паролі не збігаються!");
            setPassword("");
            setCopyPassword("");
            return;
        }
    
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(user);
            setCurrentUser(user); 
            setError("");
            setEmail("");
            setPassword("");
            setCopyPassword("");
            navigate("/main"); 
        } catch (error) {
            console.error(error);
            setError("Помилка при реєстрації!");
        }
    };

    return (
        <div className="signin-background">
            <div className="signin-container">
                <form className="signin-form" onSubmit={register}>
                    <h2>Створення Акаунту</h2>
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
                    <input
                        className="signin-input"
                        placeholder="Підтвердження паролю"
                        value={copypassword}
                        onChange={(e) => setCopyPassword(e.target.value)}
                        type="password"
                        required
                    />
                    <button className="signin-button" type="submit">Створити Акаунт</button>
                    {error && <p className="error-message">{error}</p>}
                    <p className="signup-prompt">Маєте акаунт? <a href="/signin">Увійти</a></p>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
