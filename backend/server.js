require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
let db, feedbacksCollection;

async function connectToMongoDB() {
    try {
        const client = new MongoClient(mongoURI);
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas');
        
        db = client.db('feedbackDB');
        feedbacksCollection = db.collection('feedbacks');
        
        return client;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.post('/api/feedback', async (req, res) => {
    const { studentName, course, rating, comments } = req.body;
    
    if (!studentName || !course || !rating) {
        return res.status(400).json({ 
            success: false, 
            error: 'Please fill all required fields' 
        });
    }

    const date = new Date().toLocaleString();
    
    try {
        const result = await feedbacksCollection.insertOne({
            studentName,
            course,
            rating: parseInt(rating),
            comments: comments || 'No comments',
            date: date,
            createdAt: new Date()
        });
        
        res.json({ 
            success: true, 
            message: '✅ Feedback submitted successfully!',
            data: {
                id: result.insertedId,
                studentName,
                course,
                rating: parseInt(rating),
                comments: comments || 'No comments',
                date: date
            }
        });
    } catch (error) {
        console.error('❌ MongoDB insert error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Database error' 
        });
    }
});

// Get all feedback
app.get('/api/feedback', async (req, res) => {
    try {
        const feedbacks = await feedbacksCollection.find({}).sort({ _id: -1 }).toArray();
        
        const formattedFeedbacks = feedbacks.map(feedback => ({
            id: feedback._id.toString(),
            studentName: feedback.studentName,
            course: feedback.course,
            rating: feedback.rating,
            comments: feedback.comments,
            date: feedback.date
        }));
        
        res.json({ 
            success: true, 
            data: formattedFeedbacks 
        });
    } catch (error) {
        console.error('❌ MongoDB select error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Database error' 
        });
    }
});

// Routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/reports.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/reports.html'));
});

// Server start
connectToMongoDB().then(client => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running: http://localhost:${PORT}`);
        console.log(`📊 Reports page: http://localhost:${PORT}/reports.html`);
        console.log(`💾 Using MongoDB Atlas`);
    });

    process.on('SIGINT', async () => {
        await client.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
    });
});