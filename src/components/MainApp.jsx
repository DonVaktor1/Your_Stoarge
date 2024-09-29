import React, { useState, useEffect } from 'react';
import './MainApp.css';
import { ref, set, push, onValue, remove } from "firebase/database";
import { auth, database } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";

const MainApp = () => {
    const [products, setProducts] = useState([]); // Список продуктів
    const [searchQuery, setSearchQuery] = useState(''); // Пошуковий запит
    const [selectedCategory, setSelectedCategory] = useState('Всі'); // Обрана категорія для фільтрації
    const [selectedProduct, setSelectedProduct] = useState(null); // Вибраний продукт для перегляду
    const [newProduct, setNewProduct] = useState({ name: '', category: '', quantity: 1 }); // Новий продукт для додавання
    const [showAddForm, setShowAddForm] = useState(false); // Показати/сховати форму додавання продукту
    const [userId, setUserId] = useState(null); // Ідентифікатор користувача

    // Зчитування даних з Firebase при завантаженні компоненту
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userId = user.uid;
                setUserId(userId); // Зберігаємо userId у стані
                console.log("Авторизований користувач:", userId); // Додаткове логування
                const productsRef = ref(database, `users/${userId}/products`);

                // Підписка на оновлення даних
                onValue(productsRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const formattedProducts = Object.keys(data).map(key => ({
                            id: key,
                            ...data[key]
                        }));
                        setProducts(formattedProducts);
                    } else {
                        setProducts([]); // Якщо даних немає, встановити порожній масив
                    }
                });
            } else {
                console.log("Користувач не авторизований");
                setUserId(null);
                setProducts([]); // Очистити продукти, якщо користувач вийшов
            }
        });

        return () => unsubscribe(); // Очищення підписки при розмонтаженні компоненту
    }, []);

    // Фільтрація продуктів
    const filteredProducts = products.filter(product =>
        (selectedCategory === 'Всі' || product.category === selectedCategory) &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Асинхронна функція для додавання нового продукту
    const addProduct = async () => {
        console.log("Додавання нового продукту:", newProduct); // Лог для перевірки даних
    
        if (newProduct.name.trim() && newProduct.quantity > 0 && newProduct.category.trim()) {
            if (userId) { // Перевірка, чи користувач авторизований
                try {
                    console.log("Додавання продукту до Firebase...");
                    const productsRef = ref(database, `users/${userId}/products`);
                    const newProductRef = push(productsRef);
                    console.log("Створено новий запис у Firebase:", newProductRef.key);
                    await set(newProductRef, {
                        name: newProduct.name,
                        category: newProduct.category,
                        quantity: newProduct.quantity,
                    });
                    console.log("Продукт успішно додано до Firebase!");
                    setShowAddForm(false);
                    setNewProduct({ name: '', category: '', quantity: 1 });
                } catch (error) {
                    console.error("Помилка додавання продукту в Firebase:", error); // Відображення помилки у консолі
                }
            } else {
                console.log("Користувач не авторизований, userId дорівнює null");
            }
        } else {
            console.log("Некоректні дані для продукту: заповніть усі поля");
        }
    };

    // Видалення продукту
    const deleteProduct = () => {
        if (userId && selectedProduct) { // Перевірка наявності `userId` та `selectedProduct`
            const productRef = ref(database, `users/${userId}/products/${selectedProduct.id}`);
            remove(productRef).then(() => {
                setSelectedProduct(null);
            });
        }
    };

    // Друк вмісту таблиці
    const printProducts = () => {
        const printContents = document.getElementById('products-table').outerHTML;
        const newWindow = window.open();
        newWindow.document.write(printContents);
        newWindow.print();
        newWindow.close();
    };

    return (
        <div className="main-container">
            {/* Меню навігації */}
            <div className="menu">
                <button className="menu-button" onClick={() => setShowAddForm(true)}>Додати продукт</button>
                <button className="menu-button" onClick={printProducts}>Друкувати таблицю</button>
            </div>

            {/* Поле фільтрації та пошуку */}
            <div className="filter-container">
                <input
                    type="text"
                    placeholder="Пошук..."
                    className="search-input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <select
                    className="category-filter"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                >
                    <option value="Всі">Всі</option>
                    {Array.from(new Set(products.map(product => product.category))).map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>
                <button className="settings-button">Налаштування</button>
            </div>

            {/* Таблиця продуктів */}
            <table id="products-table" className="product-table">
                <thead>
                    <tr>
                        <th>Назва</th>
                        <th>Категорія</th>
                        <th>Кількість</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map(product => (
                        <tr key={product.id} onClick={() => setSelectedProduct(product)}>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>{product.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Форма додавання нового продукту */}
            {showAddForm && (
                <div className="product-details">
                    <div className="details-content">
                        <h2>Додати новий продукт</h2>
                        <input
                            type="text"
                            placeholder="Назва продукту"
                            value={newProduct.name}
                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Категорія"
                            value={newProduct.category}
                            onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Кількість"
                            value={newProduct.quantity}
                            min="1"
                            onChange={e => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
                        />
                        <div>
                            <button className="add-button" onClick={addProduct}>Додати</button>
                            <button className="cancel-button" onClick={() => setShowAddForm(false)}>Скасувати</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Детальна інформація про продукт */}
            {selectedProduct && (
                <div className="product-details">
                    <div className="details-content">
                        <h2>Деталі продукту</h2>
                        <p><b>Назва:</b> {selectedProduct.name}</p>
                        <p><b>Категорія:</b> {selectedProduct.category}</p>
                        <p><b>Кількість:</b> {selectedProduct.quantity}</p>
                        <button className="delete-button" onClick={deleteProduct}>Видалити продукт</button>
                        <button onClick={() => setSelectedProduct(null)}>Закрити</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainApp;
