# Architecture Documentation

## Overview

This application follows Clean Architecture principles with a clear separation of concerns between presentation, business logic, and data access layers.

## Layers

### 1. Presentation Layer (UI)

**Location**: `app/`, `components/`

**Responsibilities**:
- Render UI components
- Handle user interactions
- Display data from services
- Client-side state management

**Components**:
- `app/page.tsx` - Home page (redirects)
- `app/auth/signin/page.tsx` - Sign-in page
- `app/dashboard/page.tsx` - Dashboard (server component)
- `components/DashboardClient.tsx` - Dashboard client component

### 2. API Layer

**Location**: `app/api/`

**Responsibilities**:
- Handle HTTP requests/responses
- Authentication/authorization
- Input validation
- Call service layer
- Return formatted responses

**Endpoints**:
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handlers
- `app/api/leetcode/link/route.ts` - Link LeetCode account
- `app/api/leetcode/submissions/route.ts` - Fetch submissions

### 3. Service Layer (Business Logic)

**Location**: `lib/services/`

**Responsibilities**:
- Implement business logic
- Orchestrate repositories
- Coordinate with external adapters
- Transaction management
- Business rule validation

**Services**:

#### AuthService
```typescript
class AuthService {
  constructor(private userRepository: IUserRepository)

  async createGuestUser(): Promise<IUser>
  async getUserById(id: string): Promise<IUser | null>
  async linkLeetCodeAccount(userId: string, username: string): Promise<IUser>
}
```

#### LeetCodeService
```typescript
class LeetCodeService {
  constructor(private leetCodeRepository: ILeetCodeRepository)

  async fetchRecentSubmissions(username: string, limit: number): Promise<DTO[]>
  async saveUserSubmissions(userId: string, submissions: DTO[]): Promise<Entity[]>
  async getUserSubmissions(userId: string, limit?: number): Promise<Entity[]>
}
```

### 4. Repository Layer (Data Access)

**Location**: `lib/repositories/`

**Responsibilities**:
- Abstract database operations
- CRUD operations
- Query building
- Database-agnostic interface

**Repositories**:

#### UserRepository
```typescript
class UserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null>
  async findByEmail(email: string): Promise<IUser | null>
  async findByGoogleId(googleId: string): Promise<IUser | null>
  async create(data: CreateUserDTO): Promise<IUser>
  async update(id: string, data: UpdateUserDTO): Promise<IUser>
  async delete(id: string): Promise<void>
}
```

#### LeetCodeRepository
```typescript
class LeetCodeRepository implements ILeetCodeRepository {
  async findByUserId(userId: string, limit?: number): Promise<ILeetCodeSubmission[]>
  async create(userId: string, submission: DTO): Promise<ILeetCodeSubmission>
  async deleteByUserId(userId: string): Promise<void>
}
```

### 5. Adapter Layer (External APIs)

**Location**: `lib/adapters/`

**Responsibilities**:
- Wrap external APIs
- Transform external data to internal format
- Handle API-specific logic
- Error handling for external services

**Adapters**:

#### LeetCodeAdapter
```typescript
class LeetCodeAdapter {
  async getRecentSubmissions(username: string, limit: number): Promise<DTO[]>
  private adaptSubmission(apiResponse: any): DTO
}
```

### 6. Domain Layer (Models)

**Location**: `lib/models/`

**Responsibilities**:
- Define domain entities
- Business logic validation
- Domain rules enforcement

**Models**:

#### User
```typescript
class User implements IUser {
  validate(): void
  isGuest(): boolean
  isGoogleUser(): boolean
  hasLeetCodeAccount(): boolean
  canConnectLeetCode(): boolean
  toJSON(): IUser
}
```

#### LeetCodeSubmission
```typescript
class LeetCodeSubmission implements ILeetCodeSubmission {
  validate(): void
  isAccepted(): boolean
  getFormattedTimestamp(): string
  toJSON(): ILeetCodeSubmission
}
```

## Design Patterns

### 1. Repository Pattern

**Purpose**: Separate data access logic from business logic

**Implementation**:
```typescript
interface IUserRepository {
  findById(id: string): Promise<IUser | null>
  create(data: CreateUserDTO): Promise<IUser>
  // ...
}

class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}
  // Implementation
}
```

**Benefits**:
- Testable (can mock repository)
- Database-agnostic business logic
- Centralized data access
- Easy to swap data sources

### 2. Service Layer Pattern

**Purpose**: Encapsulate business logic

**Implementation**:
```typescript
class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  async createGuestUser(): Promise<IUser> {
    // Business logic here
    return await this.userRepository.create(...)
  }
}
```

**Benefits**:
- Reusable business logic
- Single source of truth
- Easier testing
- Clear separation of concerns

### 3. Adapter Pattern

**Purpose**: Adapt external APIs to internal interfaces

**Implementation**:
```typescript
class LeetCodeAdapter {
  async getRecentSubmissions(username: string): Promise<DTO[]> {
    const response = await axios.post(LEETCODE_API, ...)
    return response.data.map(item => this.adaptSubmission(item))
  }

  private adaptSubmission(apiData: any): DTO {
    return {
      submissionId: apiData.id,
      title: apiData.title,
      // Transform external format to internal
    }
  }
}
```

**Benefits**:
- Isolates external dependencies
- Easy to mock in tests
- Can swap implementations
- Protects from API changes

### 4. Strategy Pattern

**Purpose**: Different authentication strategies

**Implementation**:
```typescript
NextAuth({
  providers: [
    GoogleProvider({ ... }),      // Google strategy
    CredentialsProvider({ ... }), // Guest strategy
  ]
})
```

**Benefits**:
- Extensible (add more providers)
- Clean separation
- Runtime selection

### 5. Dependency Injection

**Purpose**: Loose coupling, easier testing

**Implementation**:
```typescript
// Inject dependencies through constructor
class AuthService {
  constructor(private userRepository: IUserRepository) {}
}

// In tests, inject mocks
const mockRepo = mockDeep<IUserRepository>()
const service = new AuthService(mockRepo)
```

**Benefits**:
- Testable (inject mocks)
- Flexible (swap implementations)
- Follows SOLID principles

## Data Flow

### 1. User Sign-In Flow

```
User clicks "Sign in with Google"
  ↓
SignIn Component calls signIn('google')
  ↓
NextAuth redirects to Google OAuth
  ↓
Google authenticates user
  ↓
Callback to /api/auth/callback/google
  ↓
NextAuth signIn callback creates/updates user
  ↓
UserRepository saves to database
  ↓
Session created
  ↓
Redirect to /dashboard
```

### 2. Link LeetCode Account Flow

```
User enters LeetCode username
  ↓
Dashboard submits to /api/leetcode/link
  ↓
API validates session
  ↓
Calls AuthService.linkLeetCodeAccount()
  ↓
AuthService validates input
  ↓
UserRepository updates user
  ↓
Returns success response
  ↓
Dashboard updates UI
```

### 3. Fetch Submissions Flow

```
User clicks "Fetch Submissions"
  ↓
Dashboard calls /api/leetcode/submissions
  ↓
API validates session and linked account
  ↓
LeetCodeService.fetchRecentSubmissions()
  ↓
LeetCodeAdapter calls external API
  ↓
Adapter transforms data
  ↓
LeetCodeService.saveUserSubmissions()
  ↓
LeetCodeRepository saves to database
  ↓
Returns submissions
  ↓
Dashboard displays data
```

## Database Schema

```prisma
model User {
  id               String   @id @default(cuid())
  email            String?  @unique
  name             String?
  image            String?
  userType         UserType @default(GUEST)
  googleId         String?  @unique
  leetcodeUsername String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  accounts     Account[]
  sessions     Session[]
  submissions  LeetCodeSubmission[]
}

model LeetCodeSubmission {
  id            String   @id @default(cuid())
  userId        String
  submissionId  String
  title         String
  titleSlug     String
  lang          String
  timestamp     String
  statusDisplay String
  runtime       String?
  memory        String?
  code          String?  @db.Text
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(...)
}
```

## Testing Strategy

### 1. Unit Tests

**What**: Test individual units in isolation

**Location**: `__tests__/unit/`

**Coverage**:
- Models: Business logic, validation
- Repositories: CRUD operations (mocked Prisma)
- Services: Business logic (mocked repositories)

**Example**:
```typescript
describe('AuthService', () => {
  let mockRepo = mockDeep<IUserRepository>()
  let service = new AuthService(mockRepo)

  test('should create guest user', async () => {
    mockRepo.create.mockResolvedValue(mockUser)
    const result = await service.createGuestUser()
    expect(result.userType).toBe(UserType.GUEST)
  })
})
```

### 2. Integration Tests

**What**: Test components and their interactions

**Location**: `__tests__/integration/`

**Coverage**:
- UI Components
- User interactions
- API route handlers

**Example**:
```typescript
describe('SignIn Page', () => {
  test('renders sign-in buttons', () => {
    render(<SignIn />)
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
  })
})
```

## Security Considerations

### 1. Authentication

- NextAuth.js handles OAuth flow
- Session tokens stored as HTTP-only cookies
- JWT strategy for stateless sessions

### 2. Authorization

- All API routes check session
- User can only access their own data
- Database queries filter by userId

### 3. Input Validation

- Services validate business rules
- API routes validate HTTP input
- TypeScript provides type safety

### 4. Database

- Prisma parameterizes queries (SQL injection protection)
- Indexes on frequently queried fields
- Cascade deletes for data integrity

## Performance Optimizations

### 1. Database

- Indexes on email, googleId, userId
- Connection pooling with Prisma
- Efficient queries (select only needed fields)

### 2. Caching

- Next.js automatic static optimization
- React Server Components reduce client bundle
- Session caching via NextAuth

### 3. API

- Limit results (5 submissions)
- Pagination ready (add offset/limit)
- Async/await for non-blocking operations

## Scalability

### Horizontal Scaling

- Stateless API (scales easily)
- Session in JWT (no session store needed)
- Database handles concurrency

### Vertical Scaling

- Efficient queries
- Connection pooling
- Lazy loading where appropriate

### Cloud Deployment

- Serverless-ready (Vercel, AWS Lambda)
- Environment-based configuration
- Database migrations via Prisma

## Future Enhancements

1. **Caching Layer**
   - Redis for session storage
   - Cache LeetCode responses

2. **Queue System**
   - Background job for fetching submissions
   - Batch processing

3. **Analytics**
   - Track submission trends
   - Progress visualization

4. **More OAuth Providers**
   - GitHub, Twitter, etc.
   - Easy to add via Strategy Pattern

5. **Real-time Updates**
   - WebSocket for live submission updates
   - Server-Sent Events
