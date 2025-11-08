#!/bin/bash

# Local Development Setup Verification Script
# This script checks if your local environment is correctly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 LeetCode OAuth App - Local Development Verification"
echo "======================================================"
echo ""

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

check_command() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅${NC} $1 is installed: $(command -v $1)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $1 is NOT installed"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

check_version() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    local cmd=$1
    local version_cmd=$2
    local min_version=$3

    if command -v $cmd &> /dev/null; then
        version=$($version_cmd 2>&1 | head -n1)
        echo -e "${GREEN}✅${NC} $cmd version: $version"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $cmd not found"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

check_file() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} File exists: $1"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌${NC} File missing: $1"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

check_directory() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} Directory exists: $1"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌${NC} Directory missing: $1"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

check_env_var() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ ! -z "${!1}" ]; then
        # Don't show full value for security
        local value="${!1}"
        local display_value="${value:0:20}..."
        echo -e "${GREEN}✅${NC} $1 is set: $display_value"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $1 is NOT set"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

check_port() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️${NC}  Port $1 is already in use"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    else
        echo -e "${GREEN}✅${NC} Port $1 is available"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    fi
}

# Phase 1: System Requirements
echo ""
echo "📦 Phase 1: System Requirements"
echo "--------------------------------"
check_version "node" "node --version" "18"
check_version "npm" "npm --version" "9"
check_command "git"
echo ""

# Phase 2: Project Setup
echo "📁 Phase 2: Project Setup"
echo "-------------------------"
check_directory "node_modules"
check_directory "app"
check_directory "lib"
check_directory "components"
check_directory "prisma"
check_directory "__tests__"
check_file "package.json"
check_file "next.config.js"
check_file "tsconfig.json"
echo ""

# Phase 3: Environment Configuration
echo "🔧 Phase 3: Environment Configuration"
echo "--------------------------------------"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅${NC} .env file exists"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    # Load .env file
    set -a
    source .env 2>/dev/null || true
    set +a

    # Check required environment variables
    check_env_var "DATABASE_URL"
    check_env_var "NEXTAUTH_URL"
    check_env_var "NEXTAUTH_SECRET"
    check_env_var "GOOGLE_CLIENT_ID"
    check_env_var "GOOGLE_CLIENT_SECRET"

    # Check optional but recommended
    if [ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        echo -e "${GREEN}✅${NC} NEXT_PUBLIC_SUPABASE_URL is set (Supabase configured)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️${NC}  NEXT_PUBLIC_SUPABASE_URL not set (using local DB?)"
    fi
else
    echo -e "${RED}❌${NC} .env file not found"
    echo -e "${YELLOW}💡${NC} Run: cp .env.example .env"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi
echo ""

# Phase 4: Dependencies
echo "📚 Phase 4: Dependencies"
echo "------------------------"
check_directory "node_modules/@prisma/client"
check_directory "node_modules/next"
check_directory "node_modules/react"
check_directory "node_modules/next-auth"
check_directory "node_modules/zod"
check_directory "node_modules/@playwright/test"
echo ""

# Phase 5: Build Artifacts
echo "🔨 Phase 5: Build Artifacts"
echo "---------------------------"
if [ -d "node_modules/.prisma/client" ]; then
    echo -e "${GREEN}✅${NC} Prisma client generated"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    echo -e "${RED}❌${NC} Prisma client not generated"
    echo -e "${YELLOW}💡${NC} Run: npm run db:generate"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi
echo ""

# Phase 6: Port Availability
echo "🌐 Phase 6: Port Availability"
echo "-----------------------------"
check_port 3000
check_port 5555
echo ""

# Phase 7: Database Connection (if DATABASE_URL is set)
if [ ! -z "$DATABASE_URL" ]; then
    echo "🗄️  Phase 7: Database Connection"
    echo "--------------------------------"

    # Try to connect using Node.js
    cat > /tmp/test-db.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('SUCCESS');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('FAILED:', error.message);
    process.exit(1);
  }
}
test();
EOF

    if node /tmp/test-db.js > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} Database connection successful"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    else
        echo -e "${RED}❌${NC} Database connection failed"
        echo -e "${YELLOW}💡${NC} Check your DATABASE_URL in .env"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    fi

    rm -f /tmp/test-db.js
    echo ""
fi

# Optional: Docker Check
echo "🐳 Phase 8: Docker (Optional)"
echo "-----------------------------"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅${NC} Docker is installed"

    if docker ps &> /dev/null; then
        echo -e "${GREEN}✅${NC} Docker daemon is running"
    else
        echo -e "${YELLOW}⚠️${NC}  Docker daemon is not running"
    fi

    if command -v docker-compose &> /dev/null; then
        echo -e "${GREEN}✅${NC} Docker Compose is installed"
    else
        echo -e "${YELLOW}⚠️${NC}  Docker Compose is not installed"
    fi
else
    echo -e "${YELLOW}⚠️${NC}  Docker is not installed (optional for local dev)"
fi
echo ""

# Summary
echo "======================================================"
echo "📊 Verification Summary"
echo "======================================================"
echo -e "Total checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Your environment is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the development server: npm run dev"
    echo "2. Open http://localhost:3000 in your browser"
    echo "3. Run tests: npm run test:ci"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "- Install missing dependencies: npm install"
    echo "- Generate Prisma client: npm run db:generate"
    echo "- Create .env file: cp .env.example .env"
    echo "- Configure environment variables in .env"
    echo ""
    echo "For detailed help, see: LOCAL_DEVELOPMENT_RUNBOOK.md"
    echo ""
    exit 1
fi
