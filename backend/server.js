const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Check if MONGO_URI exists
if (!process.env.MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI is missing in your .env file or environment variables.');
    process.exit(1);
}

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

// ✅ Setup session store in MongoDB
app.use(session({
    secret: process.env.SESSION_SECRET || 'changeme',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Shopping Site' });
});

// Example route to store session data
app.get('/set-session', (req, res) => {
    req.session.user = { name: 'John Doe', cart: [] };
    res.send('Session data set!');
});

app.get('/get-session', (req, res) => {
    res.send(req.session.user || 'No session found');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
