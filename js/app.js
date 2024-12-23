const express = require('express');
const path = require('path');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');

// DB connection

const url = 'mongodb+srv://admin:admin@cluster0.qad2i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

// Middleware для обработки данных формы
app.use(express.urlencoded({ extended: true }));

// Настройка статических файлов
app.use(express.static(path.join(__dirname, '../public')));

// Маршрут для главной страницы (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Маршрут для обработки логина
app.post('/login', (req, res) => {
    console.log('POST /login сработал!');
    console.log('Данные формы:', req.body);
    res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});

app.post('/main', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'main.html'));
});


// Маршрут для основной страницы
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'main.html'));
});

// Маршрут для страницы forgot
app.get('/forgot', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'forgot.html'));
});

// Маршрут для обработки forgot-password
app.post('/forgot-password', (req, res) => {
    const { email } = req.body; // Получаем email из формы
    console.log(`Запрос на восстановление пароля для email: ${email}`);

    // После обработки перенаправляем на reset.html
    res.redirect('/reset.html');
});

// Маршрут для страницы reset.html
app.get('/reset.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'reset.html'));
});

// Обработка нового пароля
app.post('/reset-password', (req, res) => {
    const { newPassword } = req.body; // Получаем новый пароль из формы
    console.log(`Новый пароль установлен: ${newPassword}`);

    // После обработки перенаправляем на index.html
    res.redirect('/');
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
