const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./feedback.db', (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        return;
    }
    console.log('✅ Connected to SQLite database');
});

// Check all data
db.all("SELECT * FROM feedbacks", [], (err, rows) => {
    if (err) {
        console.error('❌ Error:', err.message);
        return;
    }
    
    console.log('\n📊 All feedbacks in database:');
    console.log('Total:', rows.length, 'records\n');
    
    rows.forEach(row => {
        console.log(`ID: ${row.id}`);
        console.log(`Name: ${row.studentName}`);
        console.log(`Course: ${row.course}`);
        console.log(`Rating: ${row.rating}`);
        console.log(`Comments: ${row.comments}`);
        console.log(`Date: ${row.date}`);
        console.log('---');
    });
    
    db.close();
});