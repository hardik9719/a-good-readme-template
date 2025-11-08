# Local Development Runbook

Complete guide for setting up and running the LeetCode OAuth App on your local machine.

## Table of Contents
- [Prerequisites Check](#prerequisites-check)
- [Initial Setup](#initial-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing Guide](#testing-guide)
- [Verification Checklist](#verification-checklist)
- [Docker Local Setup](#docker-local-setup)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)
- [Development Workflow](#development-workflow)

---

## Prerequisites Check

### Required Software

Run these commands to verify you have the required software installed:

```bash
# Node.js (v18 or higher)
node --version
# Expected: v18.x.x or higher

# npm (comes with Node.js)
npm --version
# Expected: 9.x.x or higher

# Git
git --version
# Expected: 2.x.x or higher

# Docker (optional, for containerized development)
docker --version
# Expected: 20.x.x or higher

# Docker Compose (optional)
docker-compose --version
# Expected: 2.x.x or higher
```

### Installation Instructions

If any software is missing:

**Node.js and npm:**
- Download from [nodejs.org](https://nodejs.org/)
- Or use nvm: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`
- Then: `nvm install 18`

**Git:**
- Download from [git-scm.com](https://git-scm.com/)
- Or use package manager:
  - macOS: `brew install git`
  - Ubuntu: `sudo apt install git`
  - Windows: Use Git for Windows installer

**Docker (optional):**
- Download from [docker.com](https://www.docker.com/products/docker-desktop)

---

## Initial Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd a-good-readme-template/leetcode-oauth-app

# Or if already cloned, navigate to the project
cd path/to/a-good-readme-template/leetcode-oauth-app
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# Verify installation
npm list --depth=0
```

**Expected output:** Should show all packages without errors.

**Verification:**
```bash
# Check if node_modules exists
ls -la node_modules | head -20

# Verify key packages are installed
npm list next react prisma
```

### 3. Verify Project Structure

```bash
# Check directory structure
ls -la

# Expected directories and files:
# ├── app/              (Next.js app directory)
# ├── components/       (React components)
# ├── lib/             (Core business logic)
# ├── prisma/          (Database schema)
# ├── __tests__/       (Test files)
# ├── k8s/             (Kubernetes configs)
# ├── postman/         (API collections)
# ├── package.json
# ├── next.config.js
# ├── tsconfig.json
# └── .env.example
```

---

## Environment Configuration

### 1. Create Environment File

```bash
# Copy example environment file
cp .env.example .env

# Open in your editor
nano .env
# Or: code .env (VS Code)
# Or: vim .env
```

### 2. Configure Supabase (Recommended for Cloud)

**Option A: Use Supabase (Cloud Database)**

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection strings:
   - **Project Settings → Database → Connection String**
   - Copy "Transaction Pooling" URL (with `pgbouncer=true`)
   - Copy "Direct Connection" URL

Update `.env`:
```env
# Supabase URLs (replace [ref], [password], [region] with your values)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres"

# Supabase API Keys (Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Option B: Use Local PostgreSQL**

If you prefer local PostgreSQL:

```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql@15
# Ubuntu: sudo apt install postgresql-15

# Start PostgreSQL
# macOS: brew services start postgresql@15
# Ubuntu: sudo systemctl start postgresql

# Create database
createdb leetcode_oauth_app

# Update .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leetcode_oauth_app?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/leetcode_oauth_app?schema=public"
```

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Navigate to: **APIs & Services → Credentials**
5. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: LeetCode OAuth App (Local)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`

6. Copy credentials to `.env`:
```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 4. Generate NextAuth Secret

```bash
# Generate a secure random secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Update `.env`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Configure Logging

```env
# Development: Use 'debug' for verbose logs
# Production: Use 'info' or 'warn'
LOG_LEVEL="debug"
NODE_ENV="development"
```

### 6. Verify Environment File

Your final `.env` should look like:

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
NEXTAUTH_SECRET="your-generated-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Logging
LOG_LEVEL="debug"
```

---

## Database Setup

### 1. Generate Prisma Client

```bash
# Generate Prisma client from schema
npm run db:generate

# Expected output:
# ✔ Generated Prisma Client
```

**Verify:**
```bash
# Check if Prisma client was generated
ls -la node_modules/.prisma/client
```

### 2. Push Database Schema

```bash
# Push schema to database
npm run db:push

# Expected output:
# The database is now in sync with your Prisma schema.
```

**Verify database tables:**
```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# This opens http://localhost:5555
# You should see tables: User, Account, Session, LeetCodeSubmission
```

### 3. Verify Database Connection

Create a test script:

```bash
# Create test file
cat > test-db.js << 'EOF'
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    const count = await prisma.user.count()
    console.log(`✅ User table accessible (${count} users)`)

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

test()
EOF

# Run test
node test-db.js

# Clean up
rm test-db.js
```

---

## Running the Application

### 1. Development Server

```bash
# Start development server
npm run dev

# Expected output:
# ▲ Next.js 16.0.1
# - Local:        http://localhost:3000
# - Ready in 2.3s
```

### 2. Verify Server is Running

Open another terminal and run:

```bash
# Check if server is responding
curl http://localhost:3000/api/health

# Expected output (JSON):
# {
#   "status": "healthy",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "uptime": 5.123,
#   "database": "connected",
#   "duration": "45ms"
# }
```

### 3. Open in Browser

Navigate to:
- **Homepage**: http://localhost:3000
- **Sign In**: http://localhost:3000/auth/signin
- **Health Check**: http://localhost:3000/api/health

**Expected behavior:**
- Homepage redirects to sign-in page
- Sign-in page shows "Sign in with Google" and "Continue as Guest" buttons
- Health check returns JSON with status "healthy"

### 4. Monitor Logs

In the terminal running `npm run dev`, you should see:

```bash
# Development logs with Pino pretty printing
[14:23:45] INFO: Server started on http://localhost:3000
[14:23:47] INFO: GET /api/health - 200
[14:23:48] INFO: GET /auth/signin
```

---

## Testing Guide

### 1. Unit & Integration Tests

```bash
# Run all unit and integration tests
npm run test:ci

# Expected output:
# Test Suites: 7 passed, 7 total
# Tests:       76 passed, 76 total
# Time:        ~7s
```

**What's being tested:**
- ✅ User model validation and business logic
- ✅ LeetCodeSubmission model
- ✅ UserRepository CRUD operations
- ✅ LeetCodeRepository operations
- ✅ AuthService (guest user creation, account linking)
- ✅ LeetCodeService (submissions fetching)
- ✅ SignIn component rendering

### 2. End-to-End Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Expected output:
# Running 12 tests using 3 workers
# 12 passed (15.2s)
```

**Run with UI (interactive):**
```bash
npm run test:e2e:ui
```

**Run headed (see browser):**
```bash
npm run test:e2e:headed
```

### 3. Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### 4. Postman API Tests

```bash
# Install Newman (Postman CLI)
npm install -g newman

# Run Postman collection
npm run postman:test

# Expected output:
# ✓ Health Check
# ✓ Get CSRF Token
# ✓ Get Session
# ...
```

---

## Verification Checklist

### ✅ Phase 1: Environment

- [ ] Node.js v18+ installed
- [ ] npm installed
- [ ] Dependencies installed (`node_modules` exists)
- [ ] `.env` file created and configured
- [ ] All environment variables set

### ✅ Phase 2: Database

- [ ] Database accessible (Supabase or local PostgreSQL)
- [ ] Prisma client generated
- [ ] Schema pushed to database
- [ ] Tables created (User, Account, Session, LeetCodeSubmission)
- [ ] Database connection test passes

### ✅ Phase 3: Application

- [ ] Development server starts without errors
- [ ] Homepage accessible (http://localhost:3000)
- [ ] Sign-in page renders correctly
- [ ] Health check endpoint returns 200
- [ ] No console errors in browser

### ✅ Phase 4: Authentication

- [ ] Google OAuth button visible
- [ ] Guest login button visible
- [ ] Clicking "Continue as Guest" creates user (check Prisma Studio)
- [ ] Google OAuth redirects correctly (if configured)

### ✅ Phase 5: Testing

- [ ] Unit tests pass (76 tests)
- [ ] E2E tests pass
- [ ] No test failures or errors
- [ ] Coverage report generates

### ✅ Phase 6: API Endpoints

Test these endpoints manually:

```bash
# Health check
curl http://localhost:3000/api/health
# Should return: {"status":"healthy",...}

# CSRF token
curl http://localhost:3000/api/auth/csrf
# Should return: {"csrfToken":"..."}

# Session (when not logged in)
curl http://localhost:3000/api/auth/session
# Should return: {}
```

---

## Docker Local Setup

### 1. Build Docker Image

```bash
# Build image
npm run docker:build

# Or manually:
docker build -t leetcode-oauth-app:local .

# Expected output:
# Successfully built abc123def456
# Successfully tagged leetcode-oauth-app:local
```

### 2. Run with Docker Compose

```bash
# Start all services (app + PostgreSQL)
npm run docker:compose:up

# Or with logs:
docker-compose up

# Expected output:
# Creating leetcode-oauth-db ... done
# Creating leetcode-oauth-app ... done
```

**Access the application:**
- App: http://localhost:3000
- PostgreSQL: localhost:5432

### 3. Stop Docker Services

```bash
# Stop services
npm run docker:compose:down

# Or:
docker-compose down
```

### 4. Docker Verification

```bash
# Check running containers
docker ps

# View logs
docker logs leetcode-oauth-app

# Execute commands in container
docker exec -it leetcode-oauth-app sh
```

---

## Common Issues & Troubleshooting

### Issue 1: Dependencies Won't Install

**Symptom:** `npm install` fails

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If using Node 20+, try with legacy peer deps
npm install --legacy-peer-deps
```

### Issue 2: Database Connection Failed

**Symptom:** "Can't reach database server" or connection timeout

**Solutions:**

**For Supabase:**
```bash
# Verify connection string format
echo $DATABASE_URL

# Test with psql
psql "postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres"

# Check if IP is whitelisted in Supabase
# Supabase Dashboard → Database → Network
```

**For Local PostgreSQL:**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
brew services start postgresql@15  # macOS
sudo systemctl start postgresql    # Linux

# Check connection
psql -U postgres -d leetcode_oauth_app -c "SELECT 1"
```

### Issue 3: Prisma Client Not Generated

**Symptom:** "Cannot find module '@prisma/client'"

**Solution:**
```bash
# Generate Prisma client
npm run db:generate

# Verify generation
ls -la node_modules/.prisma/client

# If still failing, reinstall @prisma/client
npm uninstall @prisma/client
npm install @prisma/client
npm run db:generate
```

### Issue 4: Google OAuth Not Working

**Symptom:** OAuth redirect fails or shows error

**Checklist:**
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- [ ] Redirect URI in Google Console matches `http://localhost:3000/api/auth/callback/google`
- [ ] Google+ API is enabled
- [ ] `NEXTAUTH_URL` is set to `http://localhost:3000`
- [ ] `NEXTAUTH_SECRET` is set (32+ characters)

**Test:**
```bash
# Check environment variables
echo $GOOGLE_CLIENT_ID
echo $NEXTAUTH_SECRET

# Verify redirect URI
curl "http://localhost:3000/api/auth/signin/google"
```

### Issue 5: Port 3000 Already in Use

**Symptom:** "Port 3000 is already in use"

**Solutions:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Issue 6: Tests Failing

**Symptom:** Some tests fail unexpectedly

**Solutions:**
```bash
# Clear Jest cache
npx jest --clearCache

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npx jest __tests__/unit/models/User.test.ts

# For E2E tests, clear Playwright cache
npx playwright install --force
```

### Issue 7: Build Fails

**Symptom:** `npm run build` fails

**Solutions:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Clear .next directory
rm -rf .next

# Rebuild
npm run build

# Check for missing environment variables
cat .env
```

### Issue 8: Docker Build Issues

**Symptom:** Docker build fails

**Solutions:**
```bash
# Build with no cache
docker build --no-cache -t leetcode-oauth-app:local .

# Check Dockerfile syntax
docker build --progress=plain -t leetcode-oauth-app:local .

# Use different builder
docker buildx create --use
docker buildx build -t leetcode-oauth-app:local .
```

---

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Update database schema if changed
npm run db:push

# 4. Start development server
npm run dev

# 5. Run tests before committing
npm run test:ci
```

### Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and test
npm run dev          # Test in browser
npm run test:ci      # Run unit tests
npm run test:e2e     # Run E2E tests

# 3. Commit changes
git add .
git commit -m "feat: your feature description"

# 4. Push branch
git push origin feature/your-feature-name
```

### Database Changes

```bash
# 1. Modify prisma/schema.prisma

# 2. Generate migration (production)
npm run db:migrate

# Or push directly (development)
npm run db:push

# 3. Regenerate Prisma client
npm run db:generate
```

### Adding New Dependencies

```bash
# Production dependency
npm install package-name

# Development dependency
npm install -D package-name

# Update package.json and commit
git add package.json package-lock.json
git commit -m "chore: add package-name dependency"
```

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run start                  # Start production server

# Testing
npm run test                   # Unit tests (watch mode)
npm run test:ci                # Unit tests (CI mode)
npm run test:e2e               # E2E tests
npm run test:all               # All tests
npm run test:coverage          # Coverage report

# Database
npm run db:generate            # Generate Prisma client
npm run db:push                # Push schema to DB
npm run db:studio              # Open Prisma Studio
npm run db:migrate             # Create migration

# Docker
npm run docker:build           # Build Docker image
npm run docker:run             # Run Docker container
npm run docker:compose:up      # Start with compose
npm run docker:compose:down    # Stop compose

# Kubernetes
npm run k8s:apply              # Deploy to K8s
npm run k8s:delete             # Delete from K8s

# API Testing
npm run postman:test           # Run Postman collection
```

### Important URLs

- **App**: http://localhost:3000
- **Sign In**: http://localhost:3000/auth/signin
- **Dashboard**: http://localhost:3000/dashboard (after login)
- **Health Check**: http://localhost:3000/api/health
- **Prisma Studio**: http://localhost:5555

### Environment Variables Quick Check

```bash
# Check all required variables are set
env | grep -E "(DATABASE_URL|NEXTAUTH|GOOGLE|SUPABASE)" | sort
```

### Log Locations

- **Development**: Terminal running `npm run dev`
- **Build**: `.next/` directory
- **Tests**: Console output
- **Docker**: `docker logs leetcode-oauth-app`

---

## Success Criteria

Your local environment is ready when:

✅ **All checks pass:**
- Server starts without errors
- Health endpoint returns 200
- Tests pass (76 unit tests)
- E2E tests pass
- Database is accessible
- Authentication pages render

✅ **You can:**
- Sign in as guest
- Sign in with Google (if configured)
- View dashboard after login
- Link LeetCode account
- Fetch submissions (with LeetCode username)

✅ **No errors in:**
- Terminal logs
- Browser console
- Test output
- API responses

---

## Getting Help

If you encounter issues not covered here:

1. **Check logs** for error messages
2. **Verify environment variables** are set correctly
3. **Review** [CLOUD_DEPLOYMENT.md](./CLOUD_DEPLOYMENT.md) for detailed setup
4. **Check** [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
5. **Search** existing GitHub issues
6. **Create** new GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details (`node --version`, `npm --version`)
   - Relevant logs

---

## Next Steps

After successful local setup:

1. **Explore the code**: Start with `app/page.tsx` and `lib/auth.ts`
2. **Run E2E tests**: `npm run test:e2e:ui` for interactive testing
3. **Try Docker**: `npm run docker:compose:up`
4. **Deploy to cloud**: Follow [CLOUD_DEPLOYMENT.md](./CLOUD_DEPLOYMENT.md)
5. **Add features**: Create new branch and start coding!

Happy coding! 🚀
