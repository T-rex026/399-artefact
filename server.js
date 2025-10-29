const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (like your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the users database.');
});

// Create the users table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        country TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Users table created or already exists.');
    }
});

// Registration endpoint
app.post('/register', (req, res) => {
    const { name, email, password, country } = req.body;

    // Input validation (basic)
    if (!name || !email || !password || !country) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Insert user into the database
    const sql = `INSERT INTO users (name, email, password, country) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, password, country], function (err) {
        if (err) {
            console.error(err.message);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ message: 'Email address already registered.' });
            }
            return res.status(500).json({ message: 'Registration failed.' });
        }

        console.log(`A row has been inserted with rowid ${this.lastID}`);
        res.status(200).json({ message: 'Registration successful!' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});