# ScanTell Tech Stack & Features

## Tech Stack

### Frontend
- **Framework**: Next.js 16.2.6 (App Router)
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React 1.17.0
- **Animations**: Lottie React 2.4.1
- **Language**: TypeScript 5

### Backend
- **API**: Next.js API Routes (App Router)
- **Authentication**: NextAuth 5.0.0-beta.31
- **Database ORM**: Prisma 7.8.0
- **Database**: PostgreSQL
- **Password Hashing**: bcryptjs 3.0.3

### Email Service
- **Provider**: Resend 6.12.4
- **Template**: Custom email templates via Resend dashboard

### File Storage
- **Blob Storage**: Vercel Blob 2.4.0

### Development
- **Package Manager**: npm
- **Linting**: ESLint 9
- **Environment**: dotenv 17.4.2

## Features

### Authentication
- **Email & Password Login**: Custom credentials provider
- **Google OAuth**: Social login via Google
- **Registration**: User sign-up with email/password
- **Password Reset**: Custom forgot/reset password flow with Resend email templates
- **Session Management**: JWT-based sessions via NextAuth
- **Email Verification**: Magic link support (ready to enable)

### User Management
- **User Profiles**: Name, email, avatar support
- **Account Linking**: Multiple OAuth accounts per user
- **Password Recovery**: Token-based reset with 1-hour expiration

### Document Management
- **Document Upload**: File upload via Vercel Blob
- **Document Storage**: PostgreSQL with file metadata
- **User Documents**: Each user can manage their own documents
- **File Size Tracking**: Automatic size calculation

### Pages & Routes
- **Home**: Landing page (`/`)
- **Login**: User authentication (`/login`)
- **Register**: New user sign-up (`/register`)
- **Dashboard**: Main user dashboard (`/dashboard`)
- **Settings**: User settings (`/dashboard/settings`)
- **Profile**: User profile page (`/profile`)
- **Chat**: Chat interface (`/chat`)
- **Explore**: Discovery page (`/explore`)
- **Forgot Password**: Password reset request (`/forgot-password`)
- **Reset Password**: Password reset form (`/reset-password`)
- **Auth Error**: Authentication error page (`/auth-error`)
- **Verify Request**: Email verification page (`/verify-request`)

### API Routes
- **Authentication**:
  - `POST /api/auth/[...nextauth]` - NextAuth handler
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/forgot-password` - Request password reset
  - `POST /api/auth/validate-reset-token` - Validate reset token
  - `POST /api/auth/reset-password` - Complete password reset
- **Documents**:
  - `GET /api/documents` - List user documents
  - `POST /api/documents` - Create document
  - `GET /api/documents/[id]` - Get single document
  - `POST /api/documents/upload` - Upload document file

### Database Schema
- **User**: User accounts with email, password, reset tokens
- **Account**: OAuth provider accounts
- **Session**: User sessions
- **Document**: User documents with file metadata

### Security
- **Password Hashing**: bcrypt with salt rounds
- **Token Expiration**: Reset tokens expire after 1 hour
- **Email Enumeration Protection**: Always returns success on forgot password
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: React's built-in escaping

### Deployment
- **Platform**: Vercel
- **Database**: PostgreSQL (hosted)
- **Environment Variables**: 
  - `RESEND_API_KEY` - Resend email service
  - `RESEND_FROM_EMAIL` - Email sender address
  - `AUTH_GOOGLE_ID` - Google OAuth client ID
  - `AUTH_GOOGLE_SECRET` - Google OAuth client secret
  - `DATABASE_URL` - PostgreSQL connection string

## Architecture Notes

### Custom Auth Flow
The application uses a custom authentication flow instead of Supabase:
- NextAuth for session management
- Prisma for database operations
- Resend for email notifications
- Custom forgot/reset password implementation

### File Upload Flow
1. User uploads file via frontend
2. File stored in Vercel Blob
3. File metadata saved to PostgreSQL via Prisma
4. File URL stored for retrieval

### Password Reset Flow
1. User requests reset via email
2. Server generates secure token (32 bytes hex)
3. Token stored in database with 1-hour expiration
4. Email sent via Resend with reset link
5. User clicks link, token validated
6. User enters new password
7. Password hashed and updated in database
8. Token cleared from database

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Generate Prisma client
npx prisma generate
```

## Future Enhancements
- Email verification (magic links)
- WebAuthn/Passkeys support
- Document sharing/collaboration
- Advanced document processing
- Multi-factor authentication
