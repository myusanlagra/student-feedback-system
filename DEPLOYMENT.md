# Deployment Guide

This guide covers deploying the Student Feedback System to AWS with high availability and auto-scaling.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [AWS Infrastructure Setup](#aws-infrastructure-setup)
- [CI/CD Configuration](#cicd-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools
- AWS CLI configured with appropriate permissions
- Terraform v1.0+
- Docker and Docker Compose
- Git

### AWS Permissions Required
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:*",
        "ecr:*",
        "iam:*",
        "vpc:*",
        "rds:*",
        "docdb:*",
        "elasticloadbalancing:*",
        "autoscaling:*",
        "cloudwatch:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## Local Development

### Using Docker Compose

1. **Start the application:**
   ```bash
   docker-compose up --build
   ```

2. **Access points:**
   - Application: http://localhost:3000
   - Reports: http://localhost:3000/reports.html
   - MongoDB: localhost:27017

3. **Stop and cleanup:**
   ```bash
   docker-compose down -v
   ```

### Manual Development Setup

1. **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Database:**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env`

## AWS Infrastructure Setup

### Step 1: Initialize Terraform

```bash
cd terraform
terraform init
```

### Step 2: Review the Plan

```bash
terraform plan
```

This will show you all resources that will be created:
- VPC with public subnets in 2 AZs
- Application Load Balancer
- ECS Cluster and Service
- DocumentDB Cluster
- Auto-scaling policies
- Security groups and IAM roles

### Step 3: Deploy Infrastructure

```bash
terraform apply
```

**Expected output:**
```
Apply complete! Resources: 25 added, 0 changed, 0 destroyed.

Outputs:
alb_dns_name = "student-feedback-alb-123456789.us-east-1.elb.amazonaws.com"
ecr_repository_url = "123456789012.dkr.ecr.us-east-1.amazonaws.com/student-feedback-app"
```

### Step 4: Configure Domain (Optional)

If you have a domain, configure Route 53:
```bash
# Add this to terraform/main.tf
resource "aws_route53_record" "app" {
  zone_id = "YOUR_ZONE_ID"
  name    = "feedback.yourdomain.com"
  type    = "A"

  alias {
    name                   = aws_lb.app.dns_name
    zone_id                = aws_lb.app.zone_id
    evaluate_target_health = true
  }
}
```

## CI/CD Configuration

### GitHub Secrets Setup

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `SLACK_WEBHOOK_URL`: For deployment notifications (optional)

### First Deployment

1. **Push code to main branch:**
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

2. **Monitor deployment:**
   - Go to GitHub Actions tab
   - Watch the "Deploy to AWS" workflow
   - Check AWS ECS console for service updates

### ECR Repository Setup

The Terraform creates an ECR repository. For manual setup:

```bash
# Create ECR repository
aws ecr create-repository --repository-name student-feedback-app --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

## Application Configuration

### Environment Variables

Update your production environment variables:

```bash
# In AWS Systems Manager Parameter Store or ECS Task Definition
MONGODB_URI=mongodb://admin:password@docdb-cluster-endpoint:27017/feedbackDB?ssl=true&replicaSet=rs0
PORT=3000
NODE_ENV=production
```

### Database Migration

If migrating from existing data:

1. **Export from current database:**
   ```bash
   mongodump --db feedbackDB --out backup
   ```

2. **Import to DocumentDB:**
   ```bash
   mongorestore --ssl --sslCAFile rds-combined-ca-bundle.pem --username admin --password password mongodb://docdb-cluster-endpoint:27017/feedbackDB backup/feedbackDB
   ```

## Monitoring & Maintenance

### CloudWatch Monitoring

- **Application Logs:** `/ecs/student-feedback-app`
- **Load Balancer Metrics:** Request count, response times
- **ECS Metrics:** CPU/Memory utilization, task count

### Auto-scaling Monitoring

Monitor scaling events:
```bash
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id service/student-feedback-cluster/student-feedback-service
```

### Health Checks

- **Load Balancer:** HTTP health checks every 30 seconds
- **ECS:** Container health checks via healthcheck.js
- **DocumentDB:** Automatic failover between AZs

## Scaling Configuration

### Manual Scaling

```bash
# Scale up to 5 instances
aws ecs update-service \
  --cluster student-feedback-cluster \
  --service student-feedback-service \
  --desired-count 5

# Scale down to 2 instances
aws ecs update-service \
  --cluster student-feedback-cluster \
  --service student-feedback-service \
  --desired-count 2
```

### Auto-scaling Policies

Current setup:
- **CPU Target:** 70% utilization
- **Min Capacity:** 2 tasks
- **Max Capacity:** 10 tasks

Modify in `terraform/main.tf`:
```hcl
resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  target_tracking_scaling_policy_configuration {
    target_value = 70.0  # Change this value
  }
}
```

## Backup & Recovery

### Database Backup

DocumentDB automatic backups are enabled (7-day retention).

### Manual Backup

```bash
# Create manual snapshot
aws docdb create-db-cluster-snapshot \
  --db-cluster-identifier student-feedback-docdb \
  --db-cluster-snapshot-identifier manual-backup-$(date +%Y%m%d)
```

### Disaster Recovery

1. **Failover:** Automatic between AZs
2. **Recovery:** Use Terraform to recreate infrastructure
3. **Data Recovery:** Restore from DocumentDB snapshot

## Cost Optimization

### Current Pricing (approximate monthly)

- **ECS Fargate:** $0.04/hour per task (2-10 tasks)
- **DocumentDB:** $0.27/hour (t3.medium instances)
- **Load Balancer:** $0.0225/hour + $0.008/LCUs
- **ECR:** $0.10/GB stored images

### Cost Saving Tips

1. **Scale down during off-hours:**
   ```bash
   # Schedule scaling via CloudWatch Events
   aws events put-rule --name "scale-down-night" --schedule-expression "cron(0 18 * * ? *)"
   ```

2. **Use reserved instances for DocumentDB** (if predictable usage)

3. **Monitor and adjust auto-scaling thresholds**

## Troubleshooting

### Common Issues

#### ECS Service Won't Start
```bash
# Check service events
aws ecs describe-services --cluster student-feedback-cluster --services student-feedback-service

# Check task definition
aws ecs describe-task-definition --task-definition student-feedback-app
```

#### Database Connection Issues
```bash
# Test DocumentDB connection
mongosh "mongodb://admin:password@docdb-endpoint:27017/feedbackDB?ssl=true&replicaSet=rs0"
```

#### Load Balancer Health Check Failures
- Check container logs in CloudWatch
- Verify healthcheck.js is working
- Ensure security groups allow health check traffic

### Logs & Debugging

#### Application Logs
```bash
aws logs tail /ecs/student-feedback-app --follow
```

#### Load Balancer Logs
Enable access logs in S3 bucket for detailed request analysis.

#### Container Logs
```bash
# Get running tasks
aws ecs list-tasks --cluster student-feedback-cluster --service-name student-feedback-service

# Get logs for specific task
aws ecs describe-tasks --cluster student-feedback-cluster --tasks <task-arn>
```

### Rollback Deployment

If deployment fails:
```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster student-feedback-cluster \
  --service student-feedback-service \
  --task-definition student-feedback-app:REVISION_NUMBER
```

## Security Best Practices

- **Rotate AWS credentials regularly**
- **Use IAM roles instead of access keys where possible**
- **Enable encryption at rest for DocumentDB**
- **Restrict security groups to minimum required access**
- **Regular security updates for container images**

## Support

For additional help:
- AWS Documentation: https://docs.aws.amazon.com/
- Terraform Registry: https://registry.terraform.io/
- GitHub Issues: Create an issue in the repository