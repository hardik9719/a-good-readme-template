# Development Scripts

Utility scripts for local development and verification.

## Available Scripts

### verify-setup.sh (Linux/macOS)

Automated verification script that checks your local development environment.

**Usage:**
```bash
# Run from project root
./scripts/verify-setup.sh

# Or
bash scripts/verify-setup.sh
```

**What it checks:**
- ✅ Node.js and npm versions
- ✅ Git installation
- ✅ Project structure and files
- ✅ Environment variables (.env)
- ✅ Dependencies installation
- ✅ Prisma client generation
- ✅ Port availability (3000, 5555)
- ✅ Database connection
- ✅ Docker installation (optional)

**Example output:**
```
🔍 LeetCode OAuth App - Local Development Verification
======================================================

📦 Phase 1: System Requirements
--------------------------------
✅ node is installed: /usr/local/bin/node
✅ npm is installed: /usr/local/bin/npm
✅ git is installed: /usr/bin/git

...

📊 Verification Summary
======================================================
Total checks: 25
Passed: 25
Failed: 0

🎉 All checks passed! Your environment is ready.
```

### verify-setup.bat (Windows)

Windows version of the verification script.

**Usage:**
```cmd
# Run from project root
scripts\verify-setup.bat
```

## Quick Start Verification

Before starting development:

```bash
# 1. Run verification
./scripts/verify-setup.sh

# 2. If checks pass, start development
npm run dev

# 3. Run tests
npm run test:ci
```

## Troubleshooting

If verification fails:

1. **Check the specific error message** - The script tells you what's wrong
2. **Follow the suggested fix** - Each failure includes a 💡 tip
3. **Refer to LOCAL_DEVELOPMENT_RUNBOOK.md** - Complete setup guide
4. **Re-run after fixes** - Run the script again to verify

## Adding New Scripts

When adding new development scripts:

1. Create the script in this directory
2. Make it executable: `chmod +x scripts/your-script.sh`
3. Add documentation here
4. Update package.json if it should be an npm script
