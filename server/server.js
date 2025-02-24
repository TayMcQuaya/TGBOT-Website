const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const cors = require('cors');

// Create/connect to SQLite database
const db = new sqlite3.Database('waitlist.db');

// Create table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    signup_date DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.use(express.json());
app.use(cors());

// Endpoint to handle email submissions
app.post('/api/waitlist', (req, res) => {
    const { email } = req.body;
    
    db.run('INSERT INTO waitlist (email) VALUES (?)', [email], function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'Email already registered' });
            }
            return res.status(500).json({ error: 'Server error' });
        }
        res.json({ message: 'Successfully joined waitlist!' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 