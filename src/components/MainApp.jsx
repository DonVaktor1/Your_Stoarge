import React, { useState, useEffect, useCallback } from 'react';
import './MainApp.css';
import { ref, set, push, onValue, remove } from "firebase/database";
import { auth, database, storage } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import printerIcon from '../assets/images/printer.png';
import settingIcon from '../assets/images/setting.png';
import plusIcon from '../assets/images/plus.png';

const MainApp = () => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Всі');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [userId, setUserId] = useState(null);
    const [errors, setErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [apiImageURL, setApiImageURL] = useState('');
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

    const fetchProductByBarcode = async (barcode) => {
        try {
            console.log('Запит штрих-коду:', barcode);
    
            const response = await fetch(`http://localhost:5000/api/barcode/${barcode}`);
    
            if (!response.ok) {
                throw new Error('Помилка при отриманні даних з проксі-сервера');
            }
    
            const productInfo = await response.json();
            console.log('Відповідь API:', productInfo);
    
            const imageURL = productInfo.products[0]?.images[0] || '';
    
            console.log('Отримано URL зображення з API:', imageURL);
            setApiImageURL(imageURL); 
            setProductImage(null); 
    
            setNewProduct((prevState) => ({
                ...prevState,
                name: productInfo.products[0]?.product_name || 'Без назви',
                category: productInfo.products[0]?.category || 'Невідома категорія',
                imageURL,  
                manufacturer: productInfo.products[0]?.manufacturer || 'Невідомий виробник',
                price: productInfo.products[0]?.stores[0]?.price 
                    ? parseFloat(productInfo.products[0].stores[0].price) 
                    : 0,
                storeLink: productInfo.products[0]?.stores[0]?.link || '#'
            }));
        } catch (error) {
            console.error('Помилка при виконанні запиту:', error);
        }
    };
    
    
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }

    useEffect(() => {
        console.log("useEffect запустився: перевірка аутентифікації");
    
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userId = user.uid;
                console.log(`Користувач авторизований: ${userId}`);
                setUserId(userId);
    
                const productsRef = ref(database, `users/${userId}/products`);
    
                onValue(productsRef, (snapshot) => {
                    const data = snapshot.val();
                    const formattedProducts = data ? Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    })) : [];
    
                    if (JSON.stringify(formattedProducts) !== JSON.stringify(products)) {
                        console.log('Отримані продукти:', formattedProducts);
                        setProducts(formattedProducts);
                    }
                });
            } else {
                console.log('Користувач не авторизований.');
                setUserId(null);
                setProducts([]);
            }
        });
    
        return () => {
            console.log("useEffect очистка: відписуємося від onAuthStateChanged.");
            unsubscribe();
        };
    }, [products])
    console.log('Компонент рендериться. Поточний стан:', { productImage, apiImageURL, selectedProduct });

    const filteredProducts = products.filter(product =>
        (selectedCategory === 'Всі' || product.category === selectedCategory) &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleImageUpload = useCallback((e) => {
        const file = e.target.files[0];
        console.log('Завантажено зображення з ПК:', file);
        
        if (file && (!productImage || productImage.name !== file.name)) {  
            setProductImage(file);
            setApiImageURL('');  
            setNewProduct(prev => ({
                ...prev,
                imageURL: ''  
            }));
            console.log('Стан productImage оновлено, URL з API очищено');
        }
    }, [productImage]);
    
 
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
                    console.log("Завантажуємо фото з ПК у Firebase Storage...");
                    imageURL = await downloadImageToStorage(productImage, newProduct.name, userId);
                    console.log("Фото з ПК завантажено:", imageURL);
                } else if (apiImageURL) {
                    imageURL = apiImageURL; 
                }
                
    
                const productWithImage = { ...newProduct, imageURL };
                const productsRef = ref(database, `users/${userId}/products`);
                const newProductRef = push(productsRef);
                await set(newProductRef, productWithImage);
    
               
                resetForm();
            } catch (error) {
                console.error("Помилка при додаванні продукту:", error);
            }
        }
    };
    
    const resetForm = () => {
        setShowAddForm(false);
        setNewProduct({ name: '', category: '', quantity: 1, price: 0, currency: 'грн', barcode: '', imageURL: '' });
        setProductImage(null);  
        setApiImageURL('');
        setErrors({});
    };
    

    const downloadImageToStorage = async (imageFile, productName, userId) => {
        console.log('початок загрузки фото');
        try {
            if (imageFile instanceof File) {
                const blob = await imageFile.arrayBuffer();
                const fileBlob = new Blob([blob], { type: imageFile.type });
                const metadata = { contentType: imageFile.type };
    
                const imageRef = storageRef(storage, `users/${userId}/products/${productName}-${Date.now()}.jpg`);
    
                const uploadResult = await uploadBytes(imageRef, fileBlob, metadata);
                
                const downloadURL = await getDownloadURL(uploadResult.ref);
                console.log('Отриманий URL зображення:', downloadURL);
                
                return downloadURL;
            } else {
                const response = await fetch(`http://localhost:5000/api/proxy-image?url=${encodeURIComponent(imageFile)}`);
                if (!response.ok) {
                    throw new Error('Помилка при завантаженні зображення через проксі');
                }
    
                const blob = await response.blob();
                const imageRef = storageRef(storage, `users/${userId}/products/${productName}-${Date.now()}.jpg`);
                const uploadResult = await uploadBytes(imageRef, blob);
                const downloadURL = await getDownloadURL(uploadResult.ref);
                return downloadURL;
            }
        } catch (error) {
            console.error('Помилка при завантаженні зображення в Firebase Storage:', error);
            throw error;
        }
    };
    
    
    
    const deleteProduct = async () => {
        if (userId && selectedProduct) {
            try {
                // Перевіряємо, чи є шлях до зображення перед видаленням
                if (selectedProduct.imageURL) {
                    // Перевіряємо, чи URL зображення веде до Firebase Storage
                    const isFirebaseStorageURL = selectedProduct.imageURL.startsWith('gs://') || selectedProduct.imageURL.startsWith('https://firebasestorage.googleapis.com/');
    
                    if (isFirebaseStorageURL) {
                        // Отримуємо посилання на зображення в Firebase Storage
                        const imageRef = storageRef(storage, selectedProduct.imageURL);
                        
                        // Перевіряємо, чи зображення існує
                        await getDownloadURL(imageRef)
                            .then(async () => {
                                // Якщо зображення існує, видаляємо його
                                await deleteObject(imageRef);
                                console.log("Зображення успішно видалено.");
                            })
                            .catch((error) => {
                                console.error("Помилка при перевірці зображення:", error);
                                // Якщо виникла помилка, просто пропустимо видалення зображення
                            });
                    } else {
                        console.log("URL не веде до Firebase Storage, зображення не буде видалено.");
                    }
                }
    
                // Видалення продукту з бази даних
                const productRef = ref(database, `users/${userId}/products/${selectedProduct.id}`);
                await remove(productRef);
    
                // Скидання вибраного продукту
                setSelectedProduct(null);
            } catch (error) {
                console.error("Помилка при видаленні продукту:", error);
            }
        }
    };
    
   


    const updateProduct = async () => {
        if (userId && selectedProduct) {
            const validationErrors = validateEditProduct(selectedProduct);
    
            if (Object.keys(validationErrors).length > 0) {
                setEditErrors(validationErrors);
                console.log("Validation errors:", validationErrors); 
                return;
            }
    
            try {
                let updatedImageURL = selectedProduct.imageURL;
                console.log("Initial updatedImageURL:", updatedImageURL); 
    
                if (productImage) {
                    console.log("New productImage detected, proceeding with image handling."); 
    
                    if (selectedProduct.imageURL && selectedProduct.imageURL.startsWith('gs://')) {
                        const oldImageRef = storageRef(storage, selectedProduct.imageURL);
                        console.log("Attempting to delete old image at:", selectedProduct.imageURL);
    
                        await deleteObject(oldImageRef).catch((error) => {
                            console.error("Помилка при видаленні старого зображення:", error);
                        });
                    } else {
                        console.log("No valid old image URL found, skipping deletion."); 
                    }
    
                    const imageRef = storageRef(storage, `users/${userId}/products/${selectedProduct.name}-${Date.now()}`);
                    console.log("Uploading new image to:", imageRef.fullPath); 
                    const uploadResult = await uploadBytes(imageRef, productImage);
                    updatedImageURL = await getDownloadURL(uploadResult.ref);
                    console.log("New image uploaded, updatedImageURL:", updatedImageURL); 
                } else {
                    console.log("No new productImage selected, keeping existing image URL."); 
                }
    
                const productRef = ref(database, `users/${userId}/products/${selectedProduct.id}`);
                console.log("Updating product in database at:", productRef.toString()); 
                await set(productRef, { ...selectedProduct, imageURL: updatedImageURL });
                console.log("Product updated successfully."); 
    
                setSelectedProduct(null);
                setProductImage(null);
                setEditErrors({});
            } catch (error) {
                console.error("Помилка при оновленні продукту:", error); 
            }
        } else {
            console.warn("User ID or selected product is not available."); 
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
        <div className="app-container">
            <div className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
            <button className="sidebar-button toggle-button" onClick={toggleSidebar}>
            {isSidebarOpen ? '←' : '→'}
                </button>
                {isSidebarOpen && (
                    <>
                        <button className="sidebar-button" onClick={() => setShowAddForm(true)}>
                            <img
                            alt="Додати" 
                            src={plusIcon}
                            />
                            Додати продукт</button>

                        <button className="sidebar-button" onClick={printProducts}>
                         <img 
                           src={printerIcon}
                           alt="Друкувати" 
                         />
                            Друкувати 
                        </button>

                        <div className="filter-group">
                            <input
                                type="text"
                                placeholder="Пошук..."
                                className="search-input"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
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
                        </div>

                        <button className="sidebar-button">
                        <img
                           src = {settingIcon}
                           alt="Налаштування" 
                        />
                        Налаштування</button>
                    </>
                )}
                
            </div>
    
            <div className={`main-content ${isSidebarOpen ? '' : 'expanded'}`}>
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
            </div>
    
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
                            <button 
                                className="search-button" 
                                onClick={() => fetchProductByBarcode(newProduct.barcode)}>
                                Шукати за штрих-кодом
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
                        <div 
                            className="image-upload-container" 
                            onClick={() => document.getElementById('imageUpload').click()}
                        >
                            {productImage ? (
                            <div className="image-preview">
                                <img 
                                    src={typeof productImage === 'string' ? productImage : URL.createObjectURL(productImage)} 
                                    alt="Product" 
                                    className="product-image-preview" 
                                />
                            </div>
                        ) : apiImageURL ? (  
                            <div className="image-preview">
                                <img 
                                    src={apiImageURL} 
                                    alt="Product from API" 
                                    className="product-image-preview" 
                                />
                            </div>
                        ) : (
                            <p>Натисніть, щоб завантажити фото</p>
                        )}
                        <input 
                            type="file" 
                            id="imageUpload" 
                            style={{ display: 'none' }}  
                            onChange={handleImageUpload}
                        />
                    </div>
                        <input
                            type="file"
                            id="imageUpload"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                        />
 
                        {productImage && (
                            <button className="clear-image-button" onClick={e => { 
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
                            <button className="cancel-button" onClick={() => setShowAddForm(false)}>Скасувати</button>
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
            <img 
                src={typeof productImage === 'string' ? productImage : URL.createObjectURL(productImage)} 
                alt="Product" 
                className="product-image-preview" 
            />
                    </div>
                ) : selectedProduct.imageURL ? (
                    <div className="image-preview">
                        <img 
                            src={selectedProduct.imageURL} 
                            alt={selectedProduct.name} 
                            className="product-image-preview" 
                        />
                    </div>
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
