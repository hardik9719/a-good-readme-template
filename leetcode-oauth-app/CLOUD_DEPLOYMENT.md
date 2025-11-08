# Cloud Deployment Guide

Complete guide for deploying the LeetCode OAuth App to cloud platforms with Supabase, Docker, Kubernetes, and Vercel.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Supabase Setup](#supabase-setup)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Postman API Testing](#postman-api-testing)
- [CI/CD Pipeline](#cicd-pipeline)

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- kubectl (for Kubernetes)
- Vercel CLI (optional)
- Postman or Newman (for API testing)
- GitHub account (for CI/CD)

## Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `leetcode-oauth-app`
   - Database Password: Generate strong password
   - Region: Choose closest to your users

### 2. Get Connection Strings

From Supabase Dashboard → Project Settings → Database:

**Transaction Pooling (for app)**:
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct Connection (for migrations)**:
```
postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
```

### 3. Get API Keys

From Supabase Dashboard → Project Settings → API:

- Project URL: `https://[ref].supabase.co`
- Anon (public) key: `eyJhbGciOi...`
- Service role (secret) key: `eyJhbGciOi...`

### 4. Run Migrations

```bash
# Set environment variables
export DATABASE_URL="your-pooling-url"
export DIRECT_URL="your-direct-url"

# Generate Prisma client
npm run db:generate

# Push schema to Supabase
npm run db:push
```

## Environment Configuration

### Local Development (.env)

```env
# Environment
NODE_ENV="development"

# Database - Supabase
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres"

# Supabase API
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Logging
LOG_LEVEL="debug"
```

### Production Environment

Use environment variables management in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Kubernetes: Secrets (see k8s/secret.yaml.template)
- Docker: .env file or docker-compose env vars

## Docker Deployment

### Build Image

```bash
# Build production image
npm run docker:build

# Or manually
docker build -t leetcode-oauth-app:latest .
```

### Run Container

```bash
# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="your-url" \
  -e DIRECT_URL="your-url" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e GOOGLE_CLIENT_ID="your-id" \
  -e GOOGLE_CLIENT_SECRET="your-secret" \
  -e NEXT_PUBLIC_SUPABASE_URL="your-url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key" \
  leetcode-oauth-app:latest
```

### Docker Compose

```bash
# Start all services
npm run docker:compose:up

# Stop all services
npm run docker:compose:down
```

### Push to Registry

```bash
# Tag image
docker tag leetcode-oauth-app:latest your-registry/leetcode-oauth-app:latest

# Push to Docker Hub
docker push your-registry/leetcode-oauth-app:latest

# Or push to private registry
docker push your-registry.com/leetcode-oauth-app:latest
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. Create Secrets

```bash
kubectl create secret generic leetcode-oauth-secrets \
  --from-literal=DATABASE_URL="your-pooling-url" \
  --from-literal=DIRECT_URL="your-direct-url" \
  --from-literal=NEXTAUTH_URL="https://your-domain.com" \
  --from-literal=NEXTAUTH_SECRET="your-secret" \
  --from-literal=GOOGLE_CLIENT_ID="your-id" \
  --from-literal=GOOGLE_CLIENT_SECRET="your-secret" \
  --from-literal=NEXT_PUBLIC_SUPABASE_URL="your-url" \
  --from-literal=NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key" \
  --from-literal=SUPABASE_SERVICE_ROLE_KEY="your-key" \
  --namespace=leetcode-oauth
```

### 3. Deploy Application

```bash
# Apply all manifests
npm run k8s:apply

# Or manually
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n leetcode-oauth

# Check deployment status
kubectl rollout status deployment/leetcode-oauth-app -n leetcode-oauth

# Check logs
kubectl logs -f deployment/leetcode-oauth-app -n leetcode-oauth

# Check service
kubectl get svc -n leetcode-oauth
```

### 5. Update Deployment

```bash
# Update image
kubectl set image deployment/leetcode-oauth-app \
  app=your-registry/leetcode-oauth-app:v2 \
  -n leetcode-oauth

# Rollback if needed
kubectl rollout undo deployment/leetcode-oauth-app -n leetcode-oauth
```

### 6. Scale Deployment

```bash
# Scale to 5 replicas
kubectl scale deployment/leetcode-oauth-app --replicas=5 -n leetcode-oauth

# Auto-scale
kubectl autoscale deployment/leetcode-oauth-app \
  --min=3 --max=10 --cpu-percent=80 \
  -n leetcode-oauth
```

## Vercel Deployment

### Option 1: Vercel Dashboard

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `leetcode-oauth-app`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add environment variables
7. Deploy

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables (Vercel)

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL
DIRECT_URL
NEXTAUTH_URL (https://your-app.vercel.app)
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
LOG_LEVEL
```

### Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update Google OAuth redirect URI
5. Update NEXTAUTH_URL environment variable

## Postman API Testing

### Import Collection

1. Open Postman
2. File → Import
3. Select `postman/leetcode-oauth-api.postman_collection.json`
4. Select `postman/leetcode-oauth.postman_environment.json`

### Run Collection

```bash
# Install Newman (Postman CLI)
npm install -g newman

# Run collection
npm run postman:test

# Or manually
newman run postman/leetcode-oauth-api.postman_collection.json \
  -e postman/leetcode-oauth.postman_environment.json
```

### Test Endpoints

1. **Health Check**: GET `/api/health`
2. **Get Session**: GET `/api/auth/session`
3. **Link LeetCode**: POST `/api/leetcode/link`
4. **Fetch Submissions**: GET `/api/leetcode/submissions`

## CI/CD Pipeline

### GitHub Actions

The project includes a complete CI/CD pipeline (`.github/workflows/ci-cd.yml`):

**Pipeline Stages**:
1. Lint code
2. Run unit tests
3. Run E2E tests
4. Build application
5. Build Docker image
6. Deploy to Vercel
7. Deploy to Kubernetes

### Required Secrets

Add these in GitHub → Repository → Settings → Secrets:

```
DATABASE_URL
DIRECT_URL
DOCKER_USERNAME
DOCKER_PASSWORD
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
KUBE_CONFIG
```

### Trigger Deployment

```bash
# Push to main branch triggers production deployment
git push origin main

# Create PR triggers tests
git checkout -b feature/new-feature
git push origin feature/new-feature
# Create PR on GitHub
```

## Testing

### Unit Tests

```bash
npm run test:ci
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run headed (see browser)
npm run test:e2e:headed

# View report
npm run test:e2e:report
```

### All Tests

```bash
npm run test:all
```

## Monitoring & Logging

### Application Logs

**Kubernetes**:
```bash
kubectl logs -f deployment/leetcode-oauth-app -n leetcode-oauth
```

**Docker**:
```bash
docker logs -f container-name
```

**Vercel**:
- Vercel Dashboard → Project → Logs

### Health Checks

```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://your-domain.com/api/health
```

### Metrics

Enable metrics in environment:
```
ENABLE_METRICS=true
```

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql "postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres"

# Check pooler
psql "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Google OAuth Not Working

1. Check redirect URI in Google Console matches NEXTAUTH_URL
2. Verify NEXTAUTH_URL is HTTPS in production
3. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
4. Ensure cookies are enabled

### Container Not Starting

```bash
# Check logs
docker logs container-name

# Check environment variables
docker inspect container-name | grep -A 20 Env

# Test locally
docker run -it --rm leetcode-oauth-app:latest /bin/sh
```

### Kubernetes Pods Failing

```bash
# Describe pod
kubectl describe pod pod-name -n leetcode-oauth

# Check events
kubectl get events -n leetcode-oauth --sort-by='.lastTimestamp'

# Check secrets
kubectl get secret leetcode-oauth-secrets -n leetcode-oauth -o yaml
```

## Security Best Practices

1. **Never commit secrets** to Git
2. **Use strong NEXTAUTH_SECRET** (32+ characters)
3. **Enable HTTPS** in production
4. **Rotate secrets** regularly
5. **Use least privilege** for service accounts
6. **Enable rate limiting** (configured in code)
7. **Monitor logs** for suspicious activity
8. **Keep dependencies updated**

## Cost Optimization

### Supabase
- Free tier: 500MB database, 2GB bandwidth
- Pro: $25/month for more resources

### Vercel
- Hobby: Free (non-commercial)
- Pro: $20/month per user

### Kubernetes
- Use autoscaling to match demand
- Set resource limits
- Use node autoscaling
- Consider spot instances

## Support

For issues:
1. Check logs first
2. Verify environment variables
3. Test database connection
4. Review OAuth configuration
5. Open GitHub issue with details

## Next Steps

1. Set up monitoring (Datadog, New Relic)
2. Configure alerts
3. Set up backups
4. Add CDN for static assets
5. Implement caching (Redis)
6. Add rate limiting per user
7. Set up error tracking (Sentry)
