const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// SQLite Database setup
const db = new sqlite3.Database('./feedback.db', (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        
        // Create table if not exists
        db.run(`CREATE TABLE IF NOT EXISTS feedbacks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentName TEXT NOT NULL,
            course TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comments TEXT,
            date TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('❌ Table creation error:', err.message);
            } else {
                console.log('✅ Feedbacks table ready');
            }
        });
    }
});

// API Routes - Database version
app.post('/api/feedback', (req, res) => {
    console.log('📝 Received:', req.body);
    
    const { studentName, course, rating, comments } = req.body;
    
    // Validation
    if (!studentName || !course || !rating) {
        return res.status(400).json({ 
            success: false, 
            error: 'Please fill all required fields' 
        });
    }

    const date = new Date().toLocaleString();
    
    // Save to database
    const sql = `INSERT INTO feedbacks (studentName, course, rating, comments, date) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [studentName, course, parseInt(rating), comments || 'No comments', date], 
    function(err) {
        if (err) {
            console.error('❌ Database insert error:', err.message);
            return res.status(500).json({ 
                success: false, 
                error: 'Database error' 
            });
        }
        
        console.log('💾 Saved to database with ID:', this.lastID);
        
        res.json({ 
            success: true, 
            message: '✅ Feedback submitted successfully!',
            data: {
                id: this.lastID,
                studentName,
                course,
                rating: parseInt(rating),
                comments: comments || 'No comments',
                date: date
            }
        });
    });
});

// Get all feedback from database
app.get('/api/feedback', (req, res) => {
    const sql = `SELECT * FROM feedbacks ORDER BY id DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Database select error:', err.message);
            return res.status(500).json({ 
                success: false, 
                error: 'Database error' 
            });
        }
        
        console.log('📋 Fetched', rows.length, 'feedbacks from database');
        res.json({ 
            success: true, 
            data: rows 
        });
    });
});

// Routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/reports.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/reports.html'));
});

// Server start
app.listen(PORT, () => {
    console.log(`🚀 Server running: http://localhost:${PORT}`);
    console.log(`📊 Reports page: http://localhost:${PORT}/reports.html`);
    console.log(`💾 Using SQLite database: feedback.db`);
});

// Graceful shutdown - close database connection
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('❌ Database close error:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});