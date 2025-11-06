document.getElementById('feedbackForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('http://localhost:3000/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById('message').textContent = 'Feedback submitted successfully!';
            event.target.reset();
        } else {
            document.getElementById('message').textContent = 'Error submitting feedback.';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').textContent = 'Error submitting feedback.';
    }
});