const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

dotenv.config();

const app = express();

// ===== Validate Environment Variables =====
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing. Add it in Render's Environment tab.");
    process.exit(1);
}
if (!process.env.SESSION_SECRET) {
    console.error("❌ SESSION_SECRET is missing. Add it in Render's Environment tab.");
    process.exit(1);
}
if (!process.env.PORT) {
    console.warn("⚠️ PORT not set. Defaulting to 5000.");
    process.env.PORT = 5000;
}

// ===== Connect to MongoDB =====
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
});

// ===== Middleware =====
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// ===== Routes =====
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// ===== Start Server =====
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
});
