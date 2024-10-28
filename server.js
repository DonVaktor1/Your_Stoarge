import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = '15wecgrlfq1bt55dcoqkwjtsdvj6gg';
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/barcode/:barcode', async (req, res) => {
    const { barcode } = req.params;
    if (!barcode) {
        return res.status(400).send('Штрих-код відсутній');
    }
    try {
        const apiUrl = `https://api.barcodelookup.com/v2/products?barcode=${barcode}&key=${API_KEY}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorResponse = await response.text(); 
            const errorMessage = errorResponse || 'Невідома помилка'; 
            throw new Error(`Помилка при отриманні даних з Barcode Lookup API: ${errorMessage}`);
        }
        const productInfo = await response.json();
        res.json(productInfo); 
    } catch (error) {
        console.error('Помилка при отриманні продукту:', error);
        res.status(500).send('Помилка при отриманні продукту');
    }
});
app.get('/api/proxy-image', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('URL відсутній');
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Помилка при отриманні зображення');
        }

    
        res.set('Content-Type', response.headers.get('content-type'));
        response.body.pipe(res); 
    } catch (error) {
        console.error('Помилка при проксіруванні зображення:', error);
        res.status(500).send('Помилка при отриманні зображення');
    }
});


app.get('/', (req, res) => {
    res.send('Сервер працює!');
});


app.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
});
