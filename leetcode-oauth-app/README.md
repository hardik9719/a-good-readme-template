# LeetCode OAuth App

A modern, cloud-based Next.js application featuring Google OAuth authentication, guest login, and LeetCode integration. Built with TypeScript, following TDD principles and implementing enterprise-grade design patterns.

## Features

- **Multiple Authentication Methods**
  - Google OAuth 2.0 integration
  - Guest login (no account required)

- **LeetCode Integration**
  - Connect your LeetCode account
  - Fetch and display your last 5 submissions
  - View submission details (status, runtime, memory, language)

- **Cloud-Ready Architecture**
  - PostgreSQL database with Prisma ORM
  - Serverless-compatible design
  - Easy deployment to Vercel, AWS, or Google Cloud

- **Best Practices**
  - Test-Driven Development (TDD) with 76+ tests
  - Design patterns: Repository, Service Layer, Adapter, Strategy
  - Clean Architecture principles
  - TypeScript for type safety
  - Comprehensive error handling

## Tech Stack

- **Frontend**: Next.js 14, React 19, TailwindCSS
- **Backend**: Next.js API Routes, NextAuth.js v5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google Provider
- **Testing**: Jest, React Testing Library
- **Language**: TypeScript

## Architecture

### Design Patterns

1. **Repository Pattern** (`lib/repositories/`)
   - Abstracts data access layer
   - Makes testing easier with dependency injection
   - Examples: `UserRepository`, `LeetCodeRepository`

2. **Service Layer Pattern** (`lib/services/`)
   - Contains business logic
   - Orchestrates repositories and external services
   - Examples: `AuthService`, `LeetCodeService`

3. **Adapter Pattern** (`lib/adapters/`)
   - Wraps external APIs (LeetCode GraphQL)
   - Isolates external dependencies
   - Example: `LeetCodeAdapter`

4. **Strategy Pattern** (NextAuth configuration)
   - Different authentication strategies (Google, Guest)
   - Easily extensible for more providers

### Project Structure

```
leetcode-oauth-app/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth endpoints
│   │   └── leetcode/             # LeetCode API endpoints
│   ├── auth/signin/              # Sign-in page
│   ├── dashboard/                # Dashboard page
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   └── DashboardClient.tsx       # Dashboard client component
├── lib/                          # Core business logic
│   ├── models/                   # Domain models
│   ├── repositories/             # Data access layer
│   ├── services/                 # Business logic layer
│   ├── adapters/                 # External API adapters
│   ├── types/                    # TypeScript interfaces
│   ├── auth.ts                   # NextAuth configuration
│   └── db.ts                     # Prisma client
├── prisma/                       # Database schema
│   └── schema.prisma
├── __tests__/                    # Test suite
│   ├── unit/                     # Unit tests
│   └── integration/              # Integration tests
└── types/                        # Type declarations
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Google OAuth credentials

### 1. Clone the Repository

```bash
git clone <repository-url>
cd leetcode-oauth-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/leetcode_oauth_app?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

NODE_ENV="development"
```

### 4. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### 5. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 6. Run Tests

```bash
# Run all tests
npm run test:ci

# Run tests in watch mode
npm test

# Generate coverage report
npm run test:coverage
```

### 7. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

### Sign In

1. Navigate to the home page
2. Choose either:
   - **Sign in with Google**: OAuth flow with your Google account
   - **Continue as Guest**: No account needed

### Link LeetCode Account

1. After signing in, go to your dashboard
2. Enter your LeetCode username
3. Click "Link Account"

### Fetch Submissions

1. Once linked, click "Fetch Latest Submissions"
2. View your last 5 LeetCode submissions
3. See details: status, language, runtime, memory

## Testing

The application follows Test-Driven Development (TDD):

- **76+ tests** covering models, repositories, services, and components
- **Unit tests** for business logic
- **Integration tests** for UI components
- **100% of core business logic tested**

```bash
# Run tests
npm test

# Run tests in CI mode
npm run test:ci

# Generate coverage report
npm run test:coverage
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Deploy to Other Platforms

The app is cloud-agnostic and can be deployed to:
- AWS (Amplify, Lambda, ECS)
- Google Cloud (Cloud Run, App Engine)
- Azure (App Service)
- Railway, Render, Fly.io

## API Endpoints

### Authentication

- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints
  - `/api/auth/signin` - Sign in
  - `/api/auth/signout` - Sign out
  - `/api/auth/callback/google` - Google OAuth callback

### LeetCode

- `POST /api/leetcode/link` - Link LeetCode account
  - Body: `{ "leetcodeUsername": "your_username" }`

- `GET /api/leetcode/submissions` - Fetch submissions
  - Requires authenticated session
  - Returns last 5 submissions

## Design Decisions

### Why Next.js?

- Built-in API routes (no separate backend needed)
- Server-side rendering for better SEO
- Easy deployment to Vercel
- Great TypeScript support

### Why Prisma?

- Type-safe database queries
- Easy migrations
- Great developer experience
- Works with multiple databases

### Why Repository Pattern?

- Separates data access from business logic
- Makes testing easier
- Allows swapping databases without changing business logic

### Why Service Layer?

- Keeps business logic separate from API routes
- Reusable across different entry points
- Easier to test

### Why Adapter Pattern?

- Isolates external API dependencies
- Makes it easy to mock in tests
- Can swap LeetCode API implementation

## Security Considerations

- **Environment Variables**: Never commit `.env` files
- **NEXTAUTH_SECRET**: Generate a strong random secret
- **HTTPS**: Always use HTTPS in production
- **Database**: Use connection pooling for production
- **Rate Limiting**: Consider adding rate limits to API routes

## Troubleshooting

### Database Connection Issues

```bash
# Check DATABASE_URL format
# Make sure PostgreSQL is running
# Verify credentials and database exists
```

### Google OAuth Not Working

```bash
# Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
# Check authorized redirect URIs in Google Console
# Ensure NEXTAUTH_URL matches your domain
```

### LeetCode API Errors

```bash
# Verify username is correct
# LeetCode API might be rate-limited
# Check network connectivity
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or production!

## Acknowledgments

- NextAuth.js team for excellent authentication library
- Prisma team for amazing ORM
- LeetCode for their GraphQL API
- Next.js team for the framework

## Support

For issues, questions, or contributions, please open an issue on GitHub.
