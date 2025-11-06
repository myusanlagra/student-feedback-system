const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database - ဒီမှာ feedbacks array ကိုသတ်မှတ်ထားပါ
let feedbacks = [];
let nextId = 1;

// API Routes
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

    const newFeedback = {
        id: nextId++,
        studentName,
        course, 
        rating: parseInt(rating),
        comments: comments || 'No comments',
        date: new Date().toLocaleString()
    };
    
    feedbacks.push(newFeedback);
    console.log('💾 Saved feedback:', newFeedback);
    console.log('📊 Total feedbacks:', feedbacks.length);
    
    res.json({ 
        success: true, 
        message: '✅ Feedback submitted successfully!',
        data: newFeedback
    });
});

// Get all feedback - ဒီ function ကိုသေချာပြင်ပါ
app.get('/api/feedback', (req, res) => {
    console.log('📋 Fetching all feedbacks. Total:', feedbacks.length);
    res.json({ 
        success: true, 
        data: feedbacks 
    });
});

// Routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/reports.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/reports.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running: http://localhost:${PORT}`);
    console.log(`📊 Reports page: http://localhost:${PORT}/reports.html`);
});