const express = require('express');
const cookieParser = require('cookie-parser');

const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');

const app = express();
app.use(cookieParser());

const PORT = 3000;

// Middleware для сесій
app.use(session({
    secret: 'your_secret_key', // Замініть на власний секрет
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // У виробництві використовуйте secure: true з HTTPS
}));

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Handlebars налаштування
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Завантаження та збереження бази даних
const loadDatabase = () => JSON.parse(fs.readFileSync('database.json', 'utf8'));
const saveDatabase = (data) => fs.writeFileSync('database.json', JSON.stringify(data, null, 2));

// Middleware для автентифікації сесій
const authenticateSession = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).render('session-expired');
    }
    next();
};

// Вихід із системи
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Failed to logout.' });
        }
        res.json({ message: 'Logged out successfully.' });
    });
});


// Відображення сторінки редагування продукту
app.get('/admin/edit-product', authenticateSession, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied. Only administrators can access this page.');
    }

    const productId = parseInt(req.query.id, 10); // Отримуємо ID продукту з параметрів запиту
    const database = loadDatabase();
    const product = database.products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).send('Product not found.');
    }

    res.render('edit-product', { product });
});

app.get('/admin/edit-products', authenticateSession, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied. Only administrators can access this page.');
    }

    const database = loadDatabase();
    res.render('edit-products', { products: database.products });
});


// Маршрут для відображення сторінки логіну
app.get('/login', (req, res) => {
    res.render('login');
});

// Обробка логіну
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log('Login request received:', { username, password });

    const database = loadDatabase();
    const user = database.users.find(u => u.username === username && u.password === password);

    if (!user) {
        console.log('User not found or incorrect password.');
        return res.status(401).json({ message: 'Invalid username or password.' });
    }

    req.session.user = { username: user.username, role: user.role };
    console.log('User authenticated and session started:', req.session.user);

    // Перенаправлення на сторінку товарів
    res.json({ message: 'Login successful', role: user.role });
});



// Вихід із системи
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Failed to logout.' });
        }
        res.json({ message: 'Logged out successfully.' });
    });
});

// Додати новий продукт (адміністратор)
app.post('/products', authenticateSession, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    const database = loadDatabase();
    const newProduct = req.body;
    newProduct.id = database.products.length ? database.products[database.products.length - 1].id + 1 : 1;

    database.products.push(newProduct);
    saveDatabase(database);
    res.status(201).json({ message: 'Product added successfully.' });
});

// Видалення продукту (адміністратор)
app.delete('/cart/:productId', authenticateSession, (req, res) => {
    const productId = parseInt(req.params.productId, 10);
    const database = loadDatabase();
    const user = req.session.user;

    if (!database.carts?.[user.username]) {
        return res.status(404).json({ message: 'Cart not found.' });
    }

    // Видаляємо товар із кошика
    database.carts[user.username] = database.carts[user.username].filter(item => item.productId !== productId);

    saveDatabase(database);
    res.status(200).json({ message: 'Product removed from cart.' });
});


// Відображення сторінки кошика
app.get('/cart', authenticateSession, (req, res) => {
    const database = loadDatabase();
    const user = req.session.user;

    // Отримуємо кошик для поточного користувача
    const cart = database.carts?.[user.username] || [];
    const products = database.products;

    // Збагачуємо дані про товари
    const enrichedCart = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return product ? { ...product, quantity: item.quantity } : null;
    }).filter(Boolean);

    res.render('cart', { cart: enrichedCart });
});




// Перегляд продуктів (клієнт)
app.get('/products', authenticateSession, (req, res) => {
    const database = loadDatabase();
    const isAdmin = req.session.user.role === 'admin'; // Визначення ролі адміністратора
    res.render('home', { products: database.products, isAdmin });
});

// Пошук і фільтрація продуктів
app.get('/products/search', authenticateSession, (req, res) => {
    const { query, minPrice, maxPrice } = req.query;

    const database = loadDatabase();
    let filteredProducts = database.products;

    // Пошук за назвою або описом
    if (query) {
        const lowerCaseQuery = query.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(lowerCaseQuery) ||
            product.description.toLowerCase().includes(lowerCaseQuery)
        );
    }

    // Фільтр за мінімальною ціною
    if (minPrice) {
        filteredProducts = filteredProducts.filter(product => parseFloat(product.price) >= parseFloat(minPrice));
    }

    // Фільтр за максимальною ціною
    if (maxPrice) {
        filteredProducts = filteredProducts.filter(product => parseFloat(product.price) <= parseFloat(maxPrice));
    }

    res.json(filteredProducts);
});



// Редагування продукту
app.post('/cart', authenticateSession, (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || quantity < 1) {
        return res.status(400).json({ message: 'Invalid product or quantity.' });
    }

    const database = loadDatabase();
    const user = req.session.user;

    // Ініціалізуємо кошик для користувача, якщо його ще немає
    database.carts = database.carts || {};
    database.carts[user.username] = database.carts[user.username] || [];

    // Знайти товар у кошику користувача
    const cart = database.carts[user.username];
    const existingProduct = cart.find(item => item.productId === productId);

    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }

    saveDatabase(database);
    res.status(200).json({ message: 'Product added to cart.' });
});



app.post('/cart', (req, res) => {
    const { productId } = req.body;

    // Валідація, якщо продукт існує
    const database = loadDatabase();
    const product = database.products.find(p => p.id === productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
    }

    // Робота з кукі
    const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
    const cartItem = cart.find(item => item.productId === productId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ productId, quantity: 1 });
    }

    // Зберігаємо кукі
    res.cookie('cart', JSON.stringify(cart), { httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 днів
    res.status(200).json({ message: 'Product added to cart.' });
});



// Розміщення замовлення (клієнт)
app.post('/order', authenticateSession, (req, res) => {
    const { name, address, phone } = req.body;

    if (!name || !address || !phone) {
        return res.status(400).json({ message: 'Усі поля є обов’язковими.' });
    }

    const database = loadDatabase();
    database.orders = database.orders || [];

    const order = {
        username: req.session.user.username, // Зберігаємо користувача, який створив замовлення
        role: req.session.user.role, // Зберігаємо роль користувача
        name,
        address,
        phone,
        date: new Date(),
    };

    database.orders.push(order);
    saveDatabase(database);

    res.status(201).json({ message: 'Замовлення успішно оформлено.' });
});


app.post('/order', (req, res) => {
    const { name, address, phone } = req.body;

    if (!name || !address || !phone) {
        return res.status(400).json({ message: 'Усі поля є обов’язковими.' });
    }

    const database = loadDatabase();
    database.orders.push({ name, address, phone, date: new Date() });

    saveDatabase(database);
    res.status(201).json({ message: 'Замовлення успішно оформлено.' });
});

// Відображення сторінок для додавання/видалення продуктів
app.get('/admin/add-product', authenticateSession, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied. Only administrators can access this page.');
    }
    res.render('add-product');
});

app.get('/admin/delete-product', authenticateSession, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied. Only administrators can access this page.');
    }
    const database = loadDatabase();
    res.render('delete-product', { products: database.products });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
