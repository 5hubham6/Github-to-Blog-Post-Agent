# 🚀 Deployment Guide

## 🐳 Docker Deployment (Recommended)

### Local Development
```bash
# 1. Clone the repository
git clone https://github.com/5hubham6/Github-to-Blog-Post-Agent.git
cd Github-to-Blog-Post-Agent

# 2. Setup environment variables
cp .env.docker .env
# Edit .env with your actual API keys

# 3. Run with Docker Compose
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost:3003
# Backend: http://localhost:3001/docs
```

### Production Deployment

#### Using Docker Compose
```bash
# Set production environment variables
export GROQ_API_KEY="your_actual_groq_key"
export HUGGINGFACE_API_KEY="your_actual_hf_token"
export NODE_ENV="production"

# Deploy
docker-compose up -d

# Monitor logs
docker-compose logs -f
```

#### Using Docker Swarm (for scaling)
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml blog-generator

# Scale services
docker service scale blog-generator_backend=3
docker service scale blog-generator_frontend=2
```

## ☁️ Cloud Deployment Options

### 1. AWS ECS/Fargate
```bash
# Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-url>
docker build -t blog-generator .
docker tag blog-generator:latest <ecr-url>/blog-generator:latest
docker push <ecr-url>/blog-generator:latest
```

### 2. Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/blog-generator
gcloud run deploy --image gcr.io/PROJECT-ID/blog-generator --platform managed
```

### 3. Azure Container Instances
```bash
# Create resource group and deploy
az group create --name blog-generator --location eastus
az container create --resource-group blog-generator --name blog-app --image blog-generator
```

### 4. DigitalOcean App Platform
- Push to GitHub
- Connect repository to App Platform
- Set environment variables
- Deploy automatically

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# At least one AI provider is required
GROQ_API_KEY=gsk_your_key_here              # Recommended (Free & Fast)
HUGGINGFACE_API_KEY=hf_your_token_here      # Alternative (Free)
OPENAI_API_KEY=sk_your_key_here             # Premium option

# Optional Azure OpenAI
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
```

### Docker Environment Files
```bash
# Development
.env.docker -> .env

# Production  
.env.production -> .env

# Staging
.env.staging -> .env
```

## 🔍 Health Checks & Monitoring

### Health Endpoints
- Backend: `GET /docs` (FastAPI auto-docs)
- Frontend: `GET /` (Next.js app)

### Docker Health Checks
```bash
# Check container health
docker-compose ps

# View health check logs
docker inspect blog-generator-backend --format='{{json .State.Health}}'
```

### Monitoring Commands
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Monitor resources
docker stats

# Container info
docker-compose ps -a
```

## 🛡️ Security in Production

### 1. Environment Variables
- Never commit .env files
- Use Docker secrets or cloud secret managers
- Rotate API keys regularly

### 2. Network Security
- Use reverse proxy (nginx/traefik)
- Enable HTTPS
- Configure proper CORS origins

### 3. Container Security
- Run as non-root user
- Use multi-stage builds
- Regular image updates

## 📈 Scaling & Performance

### Horizontal Scaling
```bash
# Scale backend
docker-compose up --scale backend=3

# Scale with Docker Swarm
docker service scale blog-generator_backend=5
```

### Load Balancing
- Use nginx or traefik for load balancing
- Configure health checks
- Session affinity for WebSocket connections

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and Deploy
        run: |
          docker build -t blog-generator .
          # Deploy to your cloud provider
```

## 🆘 Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in docker-compose.yml
2. **API key issues**: Verify environment variables
3. **Build failures**: Check Docker logs
4. **Network issues**: Verify container networking

### Debug Commands
```bash
# Container logs
docker-compose logs backend
docker-compose logs frontend

# Enter container shell
docker-compose exec backend /bin/bash
docker-compose exec frontend /bin/sh

# Check environment variables
docker-compose exec backend env
```
