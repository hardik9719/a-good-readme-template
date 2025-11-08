# Deployment Guide

This guide covers deploying the LeetCode OAuth App to various cloud platforms.

## Prerequisites

- Git repository (GitHub, GitLab, Bitbucket)
- PostgreSQL database (cloud or self-hosted)
- Google OAuth credentials
- Node.js 18+ runtime

## Environment Variables

All platforms need these environment variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=production
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest deployment option for Next.js apps.

### Step 1: Prepare Database

Use a cloud PostgreSQL provider:
- [Neon](https://neon.tech) (Serverless Postgres, free tier)
- [Supabase](https://supabase.com) (PostgreSQL + extras, free tier)
- [Railway](https://railway.app) (PostgreSQL, free tier)
- AWS RDS, Google Cloud SQL, Azure Database

### Step 2: Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your OAuth credentials
3. Add authorized redirect URI:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```

### Step 3: Deploy to Vercel

#### Option A: Via Vercel Dashboard

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `leetcode-oauth-app`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add environment variables (all from above)
7. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd leetcode-oauth-app
vercel

# Follow prompts, then add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET

# Deploy to production
vercel --prod
```

### Step 4: Run Database Migrations

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Set up environment
vercel env pull

# Run Prisma commands
npx prisma generate
npx prisma db push
```

### Step 5: Test

Visit your deployment URL and test:
1. Sign in with Google
2. Sign in as Guest
3. Link LeetCode account
4. Fetch submissions

## Option 2: Deploy to AWS

### Using AWS Amplify

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Create Amplify App**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect GitHub repository
   - Select `leetcode-oauth-app` folder

3. **Configure Build**
   ```yaml
   version: 1
   applications:
     - frontend:
         phases:
           preBuild:
             commands:
               - cd leetcode-oauth-app
               - npm ci
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: .next
           files:
             - '**/*'
         cache:
           paths:
             - node_modules/**/*
   ```

4. **Add Environment Variables**
   - In Amplify Console, go to Environment variables
   - Add all required variables

5. **Deploy**
   - Save and deploy
   - Update Google OAuth redirect URI

### Using AWS Lambda + API Gateway

```bash
# Install Serverless Framework
npm install -g serverless

# Create serverless.yml in project root
# See serverless.yml example below

# Deploy
serverless deploy
```

Example `serverless.yml`:
```yaml
service: leetcode-oauth-app

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1

functions:
  app:
    handler: .next/serverless.handler
    events:
      - http: ANY /
      - http: ANY /{proxy+}
    environment:
      DATABASE_URL: ${env:DATABASE_URL}
      NEXTAUTH_URL: ${env:NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${env:NEXTAUTH_SECRET}
      GOOGLE_CLIENT_ID: ${env:GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${env:GOOGLE_CLIENT_SECRET}

plugins:
  - serverless-nextjs-plugin
```

## Option 3: Deploy to Google Cloud

### Using Cloud Run

1. **Install Google Cloud CLI**
   ```bash
   gcloud init
   ```

2. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npx prisma generate
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

3. **Build and Deploy**
   ```bash
   # Set project
   gcloud config set project YOUR_PROJECT_ID

   # Build image
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/leetcode-app

   # Deploy to Cloud Run
   gcloud run deploy leetcode-app \
     --image gcr.io/YOUR_PROJECT_ID/leetcode-app \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars DATABASE_URL=$DATABASE_URL,NEXTAUTH_URL=$NEXTAUTH_URL,...
   ```

4. **Update OAuth Redirect**
   - Use the Cloud Run URL in Google OAuth settings

### Using App Engine

1. **Create `app.yaml`**
   ```yaml
   runtime: nodejs18
   env: standard
   instance_class: F1

   env_variables:
     DATABASE_URL: "your-database-url"
     NEXTAUTH_URL: "https://your-app.uc.r.appspot.com"
     NEXTAUTH_SECRET: "your-secret"
     GOOGLE_CLIENT_ID: "your-client-id"
     GOOGLE_CLIENT_SECRET: "your-client-secret"
   ```

2. **Deploy**
   ```bash
   gcloud app deploy
   ```

## Option 4: Deploy to Railway

Railway provides simple deployments with PostgreSQL included.

1. **Create Railway Account**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub

2. **Deploy**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway auto-detects Next.js

3. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically adds DATABASE_URL

4. **Add Other Variables**
   - Go to Variables tab
   - Add NEXTAUTH_URL, NEXTAUTH_SECRET, etc.

5. **Deploy**
   - Railway automatically deploys on git push

## Option 5: Deploy to Render

1. **Create Render Account**
   - Go to [Render](https://render.com)

2. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Note the connection string

3. **Create Web Service**
   - New → Web Service
   - Connect GitHub repository
   - Settings:
     - Build Command: `cd leetcode-oauth-app && npm install && npm run build`
     - Start Command: `cd leetcode-oauth-app && npm start`

4. **Add Environment Variables**
   - Add all required variables
   - Use PostgreSQL connection string

5. **Deploy**
   - Click "Create Web Service"

## Option 6: Docker Deployment

For self-hosted or container platforms.

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Update next.config.js

```javascript
module.exports = {
  output: 'standalone',
  // ... rest of config
}
```

### Build and Run

```bash
# Build
docker build -t leetcode-oauth-app .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e GOOGLE_CLIENT_ID="your-id" \
  -e GOOGLE_CLIENT_SECRET="your-secret" \
  leetcode-oauth-app
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/leetcode_app
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=leetcode_app
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up
```

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] Google OAuth redirect URIs updated
- [ ] HTTPS enabled (required for OAuth)
- [ ] Test Google sign-in
- [ ] Test guest sign-in
- [ ] Test LeetCode integration
- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure CDN if needed
- [ ] Set up database backups

## Monitoring and Maintenance

### Logs

- **Vercel**: Dashboard → Logs
- **AWS**: CloudWatch
- **Google Cloud**: Cloud Logging
- **Railway/Render**: Built-in logs

### Error Tracking

Install Sentry:
```bash
npm install @sentry/nextjs
```

Configure in `sentry.client.config.js` and `sentry.server.config.js`

### Database Backups

- **Neon**: Automatic daily backups
- **Supabase**: Point-in-time recovery
- **AWS RDS**: Automated backups
- **Railway**: Automatic backups

### Performance Monitoring

- Use Vercel Analytics
- Google Analytics
- New Relic
- Datadog

## Troubleshooting

### Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Database Connection Issues

- Check DATABASE_URL format
- Verify database is accessible from deployment
- Check connection pooling limits
- Enable SSL if required

### OAuth Issues

- Verify redirect URIs match exactly
- Check NEXTAUTH_URL is correct
- Ensure HTTPS in production
- Verify client ID and secret

### Environment Variables Not Working

- Rebuild after adding variables
- Check variable names (case-sensitive)
- Verify no quotes around values
- Restart service after changes

## Scaling Considerations

### Database

- Use connection pooling (PgBouncer)
- Set up read replicas for read-heavy workloads
- Monitor slow queries
- Index frequently queried fields

### Application

- Enable caching (Redis, Vercel Edge)
- Use CDN for static assets
- Implement rate limiting
- Consider serverless functions for API routes

### Cost Optimization

- Use serverless for variable traffic
- Set up auto-scaling
- Monitor database connections
- Optimize bundle size

## Security Checklist

- [ ] HTTPS enabled
- [ ] Strong NEXTAUTH_SECRET
- [ ] Database credentials secure
- [ ] Environment variables not in code
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection (React)
- [ ] CSRF protection (NextAuth)

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connection
4. Review OAuth configuration
5. Open issue on GitHub
