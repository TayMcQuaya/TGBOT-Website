require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Environment variables with defaults
const {
    PORT = 3000,
    NODE_ENV = 'development',
    RATE_LIMIT_WINDOW = 60000,
    MAX_REQUESTS_PER_WINDOW = 5,
    DB_NAME = 'waitlist.db'
} = process.env;

// Database connection
let db;
function connectDatabase() {
    return new Promise((resolve, reject) => {
        const dbFile = path.join(__dirname, DB_NAME);
        
        // Simple database connection
        db = new sqlite3.Database(dbFile, (err) => {
            if (err) {
                console.error('Database connection error:', err);
                reject(err);
                return;
            }
            console.log(`Connected to database: ${dbFile}`);
            resolve(db);
        });
    });
}

// Initialize database and create table
async function initializeDatabase() {
    try {
        await connectDatabase();
        
        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS waitlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                signup_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                    reject(err);
                    return;
                }
                console.log('Database initialized successfully');
                resolve();
            });
        });
    } catch (err) {
        console.error('Database initialization failed:', err);
        process.exit(1);
    }
}

// Middleware for basic request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${NODE_ENV}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.use(express.json());

// Simple CORS configuration
app.use(cors({
    origin: NODE_ENV === 'development' 
        ? [
            'http://localhost:8000',
            'http://127.0.0.1:8000',
            'http://192.168.1.19:8000',
            'http://[::]:8000',
            'http://192.168.1.14:8000'  // Your mobile device IP
          ]
        : ['https://your-production-domain.com'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Rate limiting configuration
const rateLimit = {};
const RATE_LIMIT_MS = parseInt(RATE_LIMIT_WINDOW);
const MAX_REQUESTS = parseInt(MAX_REQUESTS_PER_WINDOW);

app.post('/api/waitlist', (req, res) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!rateLimit[ip]) {
        rateLimit[ip] = {
            count: 1,
            firstRequest: now
        };
    } else {
        if (now - rateLimit[ip].firstRequest > RATE_LIMIT_MS) {
            rateLimit[ip] = {
                count: 1,
                firstRequest: now
            };
        } else if (rateLimit[ip].count >= MAX_REQUESTS) {
            return res.status(429).json({ 
                error: 'Too many requests. Please try again later.' 
            });
        } else {
            rateLimit[ip].count++;
        }
    }

    const { email } = req.body;
    
    if (!email || !email.includes('@') || email.length > 255) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    db.run('INSERT INTO waitlist (email) VALUES (?)', [email], function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'Email already registered' });
            }
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json({ message: 'Successfully joined waitlist!' });
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Statistics endpoint
app.get('/api/stats', (req, res) => {
    db.get('SELECT COUNT(*) as total FROM waitlist', [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Could not fetch statistics' });
        }
        res.json({ 
            totalSignups: row.total,
            environment: NODE_ENV
        });
    });
});

// Cleanup old rate limiting data
setInterval(() => {
    const now = Date.now();
    Object.keys(rateLimit).forEach(ip => {
        if (now - rateLimit[ip].firstRequest > RATE_LIMIT_MS) {
            delete rateLimit[ip];
        }
    });
}, RATE_LIMIT_MS);

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});