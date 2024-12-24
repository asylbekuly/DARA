require('dotenv').config(); 
const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit'); 
const Joi = require('joi'); 
const cookieParser = require('cookie-parser'); 


const app = express();
const uri = process.env.MONGODB_URI;

// DB Connection
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(helmet());
app.use(cookieParser());

// Limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "There are too many requests from this IP, try again later.",
});
app.use('/login', limiter);

// Validation
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

// Middleware for token cheking
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).send('Access is denied.');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token.');
        req.user = user;
        next();
    });
}

// DB connection
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connection to MongoDB succeed.");
        return client.db("clinic_service").collection("users");
    } catch (error) {
        console.error("Connection error with MongoDB:", error);
        process.exit(1);
    }
}

// Paths
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

app.post('/login', async (req, res) => {
    // Validation of data
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const { email, password } = req.body;

    try {
        const collection = await connectToDatabase();

        // Check if exists
        const user = await collection.findOne({ email });
        if (!user) {
            return res.status(400).send("There is no user with this email.");
        }

        // Chekcing pass
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send("Invalid password.");
        }

        // Creating token
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true }).redirect('/dashboard');
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Login error.");
    }
});

app.get('/dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'register.html'));
});

app.get('/forgot', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'forgot.html'));
});

app.post('/main', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'main.html'));
});

app.post('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});



app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const collection = await connectToDatabase();

        // Checking email
        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User with email already exists.");
        }

        // Passsword hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Pushing to DB
        const result = await collection.insertOne({
            email,
            password: hashedPassword,
            registerDate: new Date(),
        });

        console.log(`User added with ID: ${result.insertedId}`);
        res.status(201).send("Registration succeed.");
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).send("Registration error.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
