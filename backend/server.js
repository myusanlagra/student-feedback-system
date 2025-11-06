const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// SQLite Database Setup (File-based - No password needed)
const dbPath = path.join(__dirname, 'feedback.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Create table
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            course TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comments TEXT,
            submission_date DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Table creation error:', err);
        } else {
            console.log('✅ Feedback table ready');
        }
    });
}

// API Routes

// Submit feedback
app.post('/api/feedback', (req, res) => {
    const { studentId, course, rating, comments } = req.body;
    
    if (!studentId || !course || !rating) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `INSERT INTO feedback (student_id, course, rating, comments) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [studentId, course, rating, comments], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to save feedback' });
        }
        
        res.json({ 
            success: true, 
            message: 'Feedback submitted successfully',
            feedbackId: this.lastID 
        });
    });
});

// Get all feedback
app.get('/api/feedback', (req, res) => {
    const sql = `SELECT * FROM feedback ORDER BY submission_date DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch feedback' });
        }
        
        res.json(rows);
    });
});

// Get statistics
app.get('/api/stats', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_feedback,
            AVG(rating) as average_rating,
            COUNT(DISTINCT course) as total_courses
        FROM feedback
    `;
    
    db.get(sql, [], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch stats' });
        }
        
        res.json(row);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api/feedback`);
});