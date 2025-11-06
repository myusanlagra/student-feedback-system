document.getElementById('loadReports').addEventListener('click', async function() {
    try {
        const response = await fetch('http://localhost:3000/feedback');
        if (response.ok) {
            const feedbacks = await response.json();
            displayReports(feedbacks);
        } else {
            document.getElementById('reports').textContent = 'Error loading reports.';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('reports').textContent = 'Error loading reports.';
    }
});

function displayReports(feedbacks) {
    const reportsDiv = document.getElementById('reports');
    reportsDiv.innerHTML = '<h2>All Feedbacks</h2>';
    feedbacks.forEach(feedback => {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.innerHTML = `
            <p><strong>Name:</strong> ${feedback.studentName}</p>
            <p><strong>Course:</strong> ${feedback.course}</p>
            <p><strong>Rating:</strong> ${feedback.rating}</p>
            <p><strong>Comments:</strong> ${feedback.comments}</p>
            <hr>
        `;
        reportsDiv.appendChild(feedbackDiv);
    });
}