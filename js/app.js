const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const auth = require('./middleware/auth');
const cardRoutes = require('./routes/card');
const settingsRoutes = require('./routes/settings');
const doctorRoutes = require('./routes/doctor');
const dashboardRoutes = require('./routes/dashboard');


const app = express();

// Security Middleware
app.use(express.json({ limit: '20kb' }));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    credentials: true
}));

// Security Headers
app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

app.options('*', cors());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

let dbConnected = false;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        dbConnected = true;
    })
    .catch(err => {
        dbConnected = false;
    });


app.use((req, res, next) => {
    if (!dbConnected) {
        if (req.accepts('html')) {
            res.status(404).sendFile(path.join(__dirname, '../public/DBError.html'));
            return;
        }
        res.status(404).json({ msg: 'Not Found' });
        return;
    }
    next(); // Proceed to the next middleware/route if DB is connected
});


app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

app.post('/main', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'main.html'));
});

app.post('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});

app.post('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'settings.html'));
});

app.post('/doctor', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'addDoctor.html'));
});

app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'main.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/main', cardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Redirect middleware
app.use((req, res, next) => {
    if (req.path === '/') {
        return res.redirect('login');
    }
    next();
});

app.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
        const newPath = req.path.slice(0, -5);
        return res.redirect(301, newPath);
    }
    next();
});

// 404 handler
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
        return;
    }
    res.status(404).json({ msg: 'Not Found' });
});


app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));