import React, { useState, useEffect } from 'react';
import './MainApp.css';
import { ref, set, push, onValue, remove } from "firebase/database";
import { auth, database, storage } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const MainApp = () => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Всі');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [newProduct, setNewProduct] = useState({ 
        name: '', 
        category: '', 
        quantity: 1, 
        price: 0, 
        currency: 'грн', 
        barcode: '', 
        imageURL: '' 
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [userId, setUserId] = useState(null);
    const [errors, setErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userId = user.uid;
                setUserId(userId);
                const productsRef = ref(database, `users/${userId}/products`);

                onValue(productsRef, (snapshot) => {
                    const data = snapshot.val();
                    const formattedProducts = data ? Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    })) : [];
                    setProducts(formattedProducts);
                });
            } else {
                setUserId(null);
                setProducts([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const filteredProducts = products.filter(product =>
        (selectedCategory === 'Всі' || product.category === selectedCategory) &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductImage(file);
        }
    };

    const validateProduct = () => {
        let errors = {};
        if (!newProduct.name.trim()) {
            errors.name = "Назва продукту є обов'язковою.";
        }
        if (!newProduct.category.trim()) {
            errors.category = "Категорія є обов'язковою.";
        }
        if (newProduct.quantity < 1) {
            errors.quantity = "Кількість повинна бути більшою за 0.";
        }
        if (newProduct.price <= 0) {
            errors.price = "Ціна повинна бути більшою за 0.";
        }
        return errors;
    };

    
    const validateEditProduct = (product) => {
        let errors = {};
        if (!product.name.trim()) {
            errors.name = "Назва продукту не може бути порожньою.";
        }
        if (!product.category.trim()) {
            errors.category = "Категорія не може бути порожньою.";
        }
        if (product.quantity < 1) {
            errors.quantity = "Кількість повинна бути більшою за 0.";
        }
        if (product.price <= 0) {
            errors.price = "Ціна повинна бути більшою за 0.";
        }
        return errors;
    };

    const isBarcodeUnique = (barcode) => {
        return !products.some(product => product.barcode === barcode);
    };

    const addProduct = async () => {
        const validationErrors = validateProduct();

        if (!isBarcodeUnique(newProduct.barcode)) {
            validationErrors.barcode = "Продукт з таким штрих-кодом вже існує.";
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (userId) {
            try {
                let imageURL = '';
                if (productImage) {
                    const imageRef = storageRef(storage, `users/${userId}/products/${newProduct.name}-${Date.now()}`);
                    const uploadResult = await uploadBytes(imageRef, productImage);
                    imageURL = await getDownloadURL(uploadResult.ref);
                }

                const productWithImage = { ...newProduct, imageURL };
                const productsRef = ref(database, `users/${userId}/products`);
                const newProductRef = push(productsRef);
                await set(newProductRef, productWithImage);

                setShowAddForm(false);
                setNewProduct({ name: '', category: '', quantity: 1, price: 0, currency: 'грн', barcode: '', imageURL: '' });
                setProductImage(null);
                setErrors({});
            } catch (error) {
                console.error("Error adding product:", error);
            }
        }
    };

    const deleteProduct = async () => {
        if (userId && selectedProduct) {
            try {
                if (selectedProduct.imageURL) {
                    const imageRef = storageRef(storage, selectedProduct.imageURL);
                    await deleteObject(imageRef);
                }

                const productRef = ref(database, `users/${userId}/products/${selectedProduct.id}`);
                await remove(productRef);

                setSelectedProduct(null);
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        }
    };


    const updateProduct = async () => {
        if (userId && selectedProduct) {
            const validationErrors = validateEditProduct(selectedProduct);
    
            if (Object.keys(validationErrors).length > 0) {
                setEditErrors(validationErrors); 
                return;
            }
    
            try {
                let updatedImageURL = selectedProduct.imageURL;
    
                if (productImage) {
                    const imageRef = storageRef(storage, `users/${userId}/products/${selectedProduct.name}-${Date.now()}`);
                    const uploadResult = await uploadBytes(imageRef, productImage);
                    updatedImageURL = await getDownloadURL(uploadResult.ref);
                }
    
                const productRef = ref(database, `users/${userId}/products/${selectedProduct.id}`);
                await set(productRef, { ...selectedProduct, imageURL: updatedImageURL });
    
                setSelectedProduct(null);
                setProductImage(null);
                setEditErrors({}); 
            } catch (error) {
                console.error("Error updating product:", error);
            }
        }
    };
    

    const printProducts = () => {
        const printWindow = window.open('', '_blank');
        const tableHTML = `
            <html>
            <head>
                <title>Друк таблиці продуктів</title>
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    tr:hover { background-color: #f1f1f1; }
                </style>
            </head>
            <body>
                <h2>Список продуктів</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Назва</th>
                            <th>Категорія</th>
                            <th>Кількість</th>
                            <th>Ціна</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredProducts.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.category}</td>
                                <td>${product.quantity}</td>
                                <td>${product.price} ${product.currency}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(tableHTML);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    };

    return (
        <div className="main-container">
            <div className="menu">
                <button className="menu-button" onClick={() => setShowAddForm(true)}>Додати продукт</button>
                <button className="menu-button" onClick={printProducts}>Друкувати таблицю</button>
            </div>

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

            <table id="products-table" className="product-table">
                <thead>
                    <tr>
                        <th>Назва</th>
                        <th>Категорія</th>
                        <th>Кількість</th>
                        <th>Ціна</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map(product => (
                        <tr key={product.id} onClick={() => setSelectedProduct(product)}>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>{product.quantity}</td>
                            <td>{`${product.price} ${product.currency}`}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showAddForm && (
                <div className="product-details">
                    <div className="details-content">
                        <h2>Додати новий продукт</h2>

                        <div className="barcode-container">
                            <input
                                type="text"
                                placeholder="Штрих код"
                                value={newProduct.barcode}
                                onChange={e => setNewProduct(prevState => ({ ...prevState, barcode: e.target.value }))}
                            />
                            <button className="search-button">
                                <svg className="barcode-icon" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16">
                                    <path fill="#ffffff" d="M2 2h2v20H2V2zm4 0h2v20H6V2zm14 0h2v20h-2V2zm-4 0h2v20h-2V2zM10 2h2v20h-2V2zm4 0h2v20h-2V2z" />
                                </svg>
                                Шукати за штрих кодом
                            </button>
                        </div>

                        {errors.barcode && <p className="error">{errors.barcode}</p>}

                        <input
                            type="text"
                            placeholder="Назва продукту"
                            value={newProduct.name}
                            onChange={e => setNewProduct(prevState => ({ ...prevState, name: e.target.value }))}
                        />
                        {errors.name && <p className="error">{errors.name}</p>}

                        <input
                            type="text"
                            placeholder="Категорія"
                            value={newProduct.category}
                            onChange={e => setNewProduct(prevState => ({ ...prevState, category: e.target.value }))}
                        />
                        {errors.category && <p className="error">{errors.category}</p>}

                        <input
                            type="number"
                            placeholder="Кількість"
                            value={newProduct.quantity}
                            min="1"
                            onChange={e => setNewProduct(prevState => ({ ...prevState, quantity: Math.max(1, parseInt(e.target.value)) }))}
                        />
                        {errors.quantity && <p className="error">{errors.quantity}</p>}

                        <div className="price-container">
                            <input
                                type="number"
                                placeholder="Ціна"
                                value={newProduct.price}
                                min="0"
                                step="0.01"
                                onChange={e => setNewProduct(prevState => ({ ...prevState, price: Math.max(0, parseFloat(e.target.value)) }))}
                            />
                            <select
                                value={newProduct.currency}
                                onChange={e => setNewProduct(prevState => ({ ...prevState, currency: e.target.value }))}
                            >
                                <option value="грн">₴</option>
                                <option value="usd">$</option>
                                <option value="eur">€</option>
                            </select>
                        </div>
                        {errors.price && <p className="error">{errors.price}</p>}

                        <div className="image-upload-container" onClick={() => document.getElementById('imageUpload').click()}>
                            {productImage ? (
                                <div className="image-preview">
                                    <img src={URL.createObjectURL(productImage)} alt="Product" className="product-image-preview" />
                                </div>
                            ) : (
                                <p>Натисніть, щоб завантажити фото</p>
                            )}
                        </div>

                        {productImage && (
                            <button className="clear-image-button" onClick={(e) => { 
                                e.stopPropagation(); 
                                setProductImage(null); 
                                document.getElementById('imageUpload').value = null; 
                            }}>
                                Очистити фото
                            </button>
                        )}

                        <input
                            type="file"
                            id="imageUpload"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                            accept="image/*"
                        />

                        <div className="agreement-container">
                            <button className="cancel-button" onClick={() => {
                                 setShowAddForm(false);
                                 setProductImage(null); 
                                 document.getElementById('imageUpload').value = null;
                            }}>Скасувати</button>
                            <button className="add-button" onClick={addProduct}>Додати</button>
                        </div>
                    </div>
                </div>
            )}
            {selectedProduct && (
    <div className="product-details">
        <div className="details-content">
            <h2>Редагувати продукт</h2>

            <input
                type="text"
                placeholder="Назва продукту"
                value={selectedProduct.name}
                onChange={e => setSelectedProduct(prev => ({ ...prev, name: e.target.value }))}
            />
            {editErrors.name && <p className="error">{editErrors.name}</p>}  

            <input
                type="text"
                placeholder="Категорія"
                value={selectedProduct.category}
                onChange={e => setSelectedProduct(prev => ({ ...prev, category: e.target.value }))}
            />
            {editErrors.category && <p className="error">{editErrors.category}</p>}  

            <input
                type="number"
                placeholder="Кількість"
                value={selectedProduct.quantity}
                min="1"
                onChange={e => setSelectedProduct(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value)) }))}
            />
            {editErrors.quantity && <p className="error">{editErrors.quantity}</p>}  

            <div className="price-container">
                <input
                    type="number"
                    placeholder="Ціна"
                    value={selectedProduct.price}
                    min="0"
                    step="0.01"
                    onChange={e => setSelectedProduct(prev => ({ ...prev, price: Math.max(0, parseFloat(e.target.value)) }))}
                />
                <select
                    value={selectedProduct.currency}
                    onChange={e => setSelectedProduct(prev => ({ ...prev, currency: e.target.value }))}
                >
                    <option value="грн">₴</option>
                    <option value="usd">$</option>
                    <option value="eur">€</option>
                </select>
            </div>
            {editErrors.price && <p className="error">{editErrors.price}</p>} 

            <div className="image-upload-container" onClick={() => document.getElementById('imageUpload').click()}>
                {productImage ? (
                    <div className="image-preview">
                        <img src={URL.createObjectURL(productImage)} alt="Product" className="product-image-preview" />
                    </div>
                ) : selectedProduct.imageURL ? (
                    <img src={selectedProduct.imageURL} alt={selectedProduct.name} className="product-image" />
                ) : (
                    <p>Натисніть, щоб завантажити фото</p>
                )}
            </div>

            {productImage && (
                <button className="clear-image-button" onClick={e => { 
                    e.stopPropagation();
                    setProductImage(null); 
                    document.getElementById('imageUpload').value = null; 
                }}>
                    Очистити фото
                </button>
            )}

            <div className="barcode-details-container">
                <p>{selectedProduct.barcode}</p>
            </div>

            <input
                type="file"
                id="imageUpload"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
                accept="image/*"
            />

            <div className="agreement-container">
                <button className="cancel-button" onClick={() => {
                    setSelectedProduct(null);
                    setProductImage(null);
                    document.getElementById('imageUpload').value = null;   
                }}>
                    Скасувати
                </button>
                <button className="delete-product-button" onClick={deleteProduct}>Видалити</button>
                <button className="add-button" onClick={updateProduct}>Зберегти</button>
            </div>
        </div>
    </div>
)}      
        </div>
    );
};

export default MainApp;
