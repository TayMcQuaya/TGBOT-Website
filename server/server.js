// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: envFile });

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Environment variables with defaults
const {
    PORT = 3000,
    NODE_ENV = 'development',
    RATE_LIMIT_WINDOW = 60000,
    MAX_REQUESTS_PER_WINDOW = 5,
    DB_NAME = 'waitlist.db',
    CORS_ALLOWED_ORIGIN = '*',
    API_KEY = 'dev_key'
} = process.env;

const isDevelopment = NODE_ENV === 'development';

// Security middleware
app.use(helmet({
    contentSecurityPolicy: isDevelopment ? false : undefined,
}));
app.disable('x-powered-by');

// Logging configuration
if (isDevelopment) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        skip: (req, res) => res.statusCode < 400,
        stream: fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a' })
    }));
    app.use(morgan('short'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(RATE_LIMIT_WINDOW),
    max: parseInt(MAX_REQUESTS_PER_WINDOW),
    message: { error: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: isDevelopment ? (req) => true : undefined
});

app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: CORS_ALLOWED_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// API key middleware - only enforced in production
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!isDevelopment && apiKey !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Database configuration
const getDbPath = () => {
    const dbDir = path.join(__dirname, isDevelopment ? 'dev_data' : 'prod_data');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    return path.join(dbDir, DB_NAME);
};

// Database connection with better error handling
let db;
function connectDatabase() {
    return new Promise((resolve, reject) => {
        const dbFile = getDbPath();
        
        // Ensure database directory exists
        const dbDir = path.dirname(dbFile);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
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

// Initialize database with automatic backups
async function initializeDatabase() {
    try {
        await connectDatabase();
        
        // Set up automatic daily backups
        if (NODE_ENV === 'production') {
            setInterval(createDatabaseBackup, 24 * 60 * 60 * 1000);
        }
        
        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS waitlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                signup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                user_agent TEXT
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

// Database backup function
async function createDatabaseBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backups');
    const backupFile = path.join(backupDir, `waitlist-${timestamp}.db`);

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create backup
    fs.copyFileSync(path.join(__dirname, DB_NAME), backupFile);

    // Clean old backups (keep last 7 days)
    const files = fs.readdirSync(backupDir);
    const oldFiles = files
        .filter(f => f.startsWith('waitlist-'))
        .sort()
        .slice(0, -7);

    oldFiles.forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
    });
}

// Waitlist submission endpoint
app.post('/api/waitlist', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email || !email.includes('@') || email.length > 255) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Store additional information
        const userAgent = req.headers['user-agent'];
        const ipAddress = req.ip;
        
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO waitlist (email, ip_address, user_agent) VALUES (?, ?, ?)',
                [email, ipAddress, userAgent],
                function(err) {
                    if (err) {
                        if (err.code === 'SQLITE_CONSTRAINT') {
                            res.status(409).json({ error: 'Email already registered' });
                        } else {
                            console.error('Database error:', err);
                            res.status(500).json({ error: 'Server error' });
                        }
                        reject(err);
                        return;
                    }
                    resolve();
                }
            );
        });
        
        res.json({ message: 'Successfully joined waitlist!' });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Protected statistics endpoint
app.get('/api/stats', apiKeyAuth, async (req, res) => {
    try {
        const stats = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total FROM waitlist', [], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
        
        res.json({ 
            totalSignups: stats.total,
            environment: NODE_ENV
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Could not fetch statistics' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    const dbHealthy = db && db.open;
    
    res.status(dbHealthy ? 200 : 503).json({ 
        status: dbHealthy ? 'healthy' : 'unhealthy',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        database: dbHealthy ? 'connected' : 'disconnected'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
});

// Start server with environment info
const server = app.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    console.log(`Database: ${getDbPath()}`);
    console.log(`CORS allowed origins: ${JSON.stringify(corsOptions.origin)}`);
    if (isDevelopment) {
        console.log('Development mode: Rate limiting disabled, API key check disabled');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed. Database connections cleaned up.');
        db.close();
        process.exit(0);
    });
});

// Initialize database and start server
initializeDatabase().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});