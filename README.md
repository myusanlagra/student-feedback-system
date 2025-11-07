# Student Feedback System

A full-stack web application for collecting and managing student feedback with cloud-native deployment capabilities.

## Features

- 📝 Student feedback collection form
- 📊 Real-time feedback reports and analytics
- 🐳 Docker containerization for easy deployment
- ☁️ Cloud-native architecture with AWS
- 🔄 Auto-scaling based on demand
- 🏗️ Infrastructure as Code with Terraform
- 🚀 CI/CD pipeline with GitHub Actions

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (local) / AWS DocumentDB (production)
- **Frontend:** HTML, CSS, JavaScript
- **Infrastructure:** Docker, AWS ECS, Terraform
- **CI/CD:** GitHub Actions

## Project Structure

```
student-feedback-system/
├── backend/
│   ├── server.js              # Main Express server
│   ├── package.json           # Backend dependencies
│   ├── Dockerfile             # Development container
│   ├── Dockerfile.prod        # Production container
│   ├── healthcheck.js         # Container health check
│   └── .env                   # Environment variables
├── frontend/
│   ├── index.html             # Main feedback form
│   ├── reports.html           # Reports dashboard
│   ├── script.js              # Frontend JavaScript
│   └── styles.css             # CSS styling
├── terraform/
│   └── main.tf                # Infrastructure as Code
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD pipeline
├── docker-compose.yml         # Local development setup
└── README.md                  # This file
```

## Local Development Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd student-feedback-system
   ```

2. **Start with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Main app: http://localhost:3000
   - Reports: http://localhost:3000/reports.html

### Manual Setup (without Docker)

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Set up MongoDB connection in .env
   npm start
   ```

2. **Frontend:**
   - Open `frontend/index.html` in browser
   - Or serve static files from backend

## Cloud Deployment

### Prerequisites

- AWS Account with appropriate permissions
- Terraform installed
- GitHub repository

### Infrastructure Setup

1. **Configure AWS:**
   ```bash
   # Set up AWS CLI with your credentials
   aws configure
   ```

2. **Deploy Infrastructure:**
   ```bash
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```

3. **Configure GitHub Secrets:**
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `SLACK_WEBHOOK_URL` (optional)

4. **Deploy Application:**
   - Push code to `main` branch
   - GitHub Actions will automatically build and deploy

### Architecture Overview

```
Internet
    ↓
AWS ALB (Load Balancer)
    ↓
AWS ECS Fargate (Auto-scaling)
    ↓
AWS DocumentDB (MongoDB-compatible)
```

## API Endpoints

### POST /api/feedback
Submit new feedback
```json
{
  "studentName": "John Doe",
  "course": "Computer Science",
  "rating": 5,
  "comments": "Great course!"
}
```

### GET /api/feedback
Retrieve all feedback entries
```json
{
  "success": true,
  "data": [...]
}
```

## Environment Variables

### Backend (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/feedbackDB
# For production: mongodb://docdb-cluster-endpoint:27017/feedbackDB
```

## Development

### Running Tests
```bash
cd backend
npm test
```

### Code Formatting
```bash
# Add your preferred formatting commands
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue in the repository
- Check the deployment logs in AWS CloudWatch
- Review GitHub Actions workflow runs