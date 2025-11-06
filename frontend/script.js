document.getElementById('feedbackForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
        // ဒီမှာ /feedback ကနေ /api/feedback ပြောင်းပါ
        const response = await fetch('http://localhost:3000/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Response ကို JSON ပြန်ပြောင်းပါ
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('message').textContent = result.message;
            document.getElementById('message').style.color = 'green';
            event.target.reset();
        } else {
            document.getElementById('message').textContent = result.error || 'Error submitting feedback.';
            document.getElementById('message').style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').textContent = 'Error submitting feedback.';
        document.getElementById('message').style.color = 'red';
    }
});