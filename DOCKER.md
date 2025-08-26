# PropertyMasters UK - Docker Setup

This document provides comprehensive instructions for building and running the PropertyMasters UK application using Docker containers.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- At least 4GB of available RAM
- At least 10GB of free disk space

## Project Structure

```
PropertyMastersUK/
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
├── backend/
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── docker/nginx/default.conf
└── docker/
    ├── nginx/nginx.conf         # Production Nginx config
    └── postgres/init.sql        # Database initialization
```

## Quick Start (Development)

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd PropertyMastersUK
```

### 2. Environment Setup
Create environment files:

**Backend (.env):**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=propertymastersuk

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Application
NODE_ENV=development
PORT=3001
JWT_SECRET=your-jwt-secret-key

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env):**
```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=PropertyMasters UK
```

### 3. Build and Run
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

## Production Deployment

### 1. Environment Setup
Create production environment files with secure values:

```bash
# Copy and edit production environment
cp backend/.env.example backend/.env.production
cp frontend/.env.example frontend/.env.production
```

### 2. Build and Deploy
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Access Production
- **Application:** http://localhost (via Nginx)
- **API:** http://localhost/api

## Docker Commands Reference

### Building
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Running
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres redis

# Start with logs
docker-compose up
```

### Monitoring
```bash
# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Check status
docker-compose ps

# Check resource usage
docker stats
```

### Maintenance
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart specific service
docker-compose restart backend

# Update and restart
docker-compose pull
docker-compose up -d
```

### Database Operations
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d propertymastersuk

# Backup database
docker-compose exec postgres pg_dump -U postgres propertymastersuk > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres propertymastersuk < backup.sql

# View database logs
docker-compose logs postgres
```

### Development Workflow
```bash
# Install new dependencies (backend)
docker-compose exec backend npm install package-name
docker-compose restart backend

# Install new dependencies (frontend)
docker-compose exec frontend npm install package-name
docker-compose restart frontend

# Run migrations
docker-compose exec backend npm run migration:run

# Generate migration
docker-compose exec backend npm run migration:generate -- -n MigrationName

# Run seeds
docker-compose exec backend npm run seed:run
```

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
netstat -tulpn | grep :3000

# Kill the process
kill -9 <PID>
```

**2. Database Connection Issues**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

**3. Build Failures**
```bash
# Clean build cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**4. Volume Issues**
```bash
# Remove all volumes
docker-compose down -v

# Remove specific volume
docker volume rm propertymastersuk_postgres_data
```

### Health Checks
```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:3001/health
curl http://localhost:3000
```

### Performance Optimization

**1. Resource Limits**
Edit `docker-compose.yml` to add resource limits:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

**2. Multi-stage Builds**
The Dockerfiles already use multi-stage builds for optimization.

**3. Layer Caching**
- Dependencies are installed before copying source code
- Use `.dockerignore` to exclude unnecessary files

## Security Considerations

### Production Security
1. **Environment Variables**: Never commit `.env` files
2. **Secrets Management**: Use Docker secrets or external secret managers
3. **Network Security**: Use custom networks and limit exposed ports
4. **Image Security**: Regularly update base images
5. **User Permissions**: Run containers as non-root users

### SSL/TLS Setup
For production, configure SSL certificates in the Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    # ... rest of configuration
}
```

## Monitoring and Logging

### Log Management
```bash
# Configure log rotation in docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Monitoring Stack
Consider adding monitoring services:
- Prometheus for metrics
- Grafana for visualization
- ELK stack for log analysis

## Backup and Recovery

### Automated Backups
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U postgres propertymastersuk > "backup_${DATE}.sql"
```

### Disaster Recovery
1. Regular database backups
2. Volume snapshots
3. Configuration backups
4. Documented recovery procedures

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Docker and application logs
3. Consult the main README.md
4. Contact the development team

---

**Note**: This setup is optimized for development. For production deployment, consider additional security measures, monitoring, and infrastructure requirements.