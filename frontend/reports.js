document.getElementById('loadReports').addEventListener('click', async function() {
    try {
        console.log('🔄 Loading reports...');
        
        const response = await fetch('http://localhost:3000/api/feedback');
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('📊 API Response:', result);
            
            if (result.success) {
                displayReports(result.data);
            } else {
                document.getElementById('reports').innerHTML = 
                    '<p style="color: red;">Error: ' + (result.error || 'Unknown error') + '</p>';
            }
        } else {
            document.getElementById('reports').innerHTML = 
                '<p style="color: red;">Server error: ' + response.status + '</p>';
        }
    } catch (error) {
        console.error('❌ Error:', error);
        document.getElementById('reports').innerHTML = 
            '<p style="color: red;">Connection error: ' + error.message + '</p>';
    }
});

function displayReports(feedbacks) {
    const reportsDiv = document.getElementById('reports');
    
    if (!feedbacks || feedbacks.length === 0) {
        reportsDiv.innerHTML = `
            <h2>All Feedbacks</h2>
            <p>No feedback submitted yet.</p>
            <p>Please submit some feedback first.</p>
        `;
        return;
    }
    
    let html = '<h2>All Feedbacks</h2>';
    
    feedbacks.forEach(feedback => {
        html += `
            <div class="feedback-item" style="
                border: 1px solid #ddd;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                background: #f9f9f9;
            ">
                <p><strong>ID:</strong> ${feedback.id}</p>
                <p><strong>Name:</strong> ${feedback.studentName}</p>
                <p><strong>Course:</strong> ${feedback.course}</p>
                <p><strong>Rating:</strong> ${'⭐'.repeat(feedback.rating)} (${feedback.rating}/5)</p>
                <p><strong>Comments:</strong> ${feedback.comments}</p>
                <p><strong>Date:</strong> ${feedback.date}</p>
            </div>
        `;
    });
    
    reportsDiv.innerHTML = html;
}

// Page load ချက်ချင်း reports တင်ပေးချင်ရင် ဒီ line ကိုဖြုတ်ပါ
// document.addEventListener('DOMContentLoaded', function() {
//     document.getElementById('loadReports').click();
// });