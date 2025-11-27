# Leo Management System

A comprehensive web application for Leo Clubs to manage projects, finances, meetings, events, and receive AI-powered assistance.

## 🌟 Features

- **Multi-Club Management**: Admin can create and manage multiple club accounts
- **Project Reporting**: Create detailed project reports with AI form-filling assistance
- **AI Project Consultant**: Get AI-powered suggestions to improve project ideas based on award/contest criteria
- **Financial Tracking**: Track income and expenses with balance calculations
- **Meeting Management**: Record meeting minutes and attendance
- **Event Planning**: Manage club events and calendars
- **Secure Authentication**: JWT-based auth with role-based access control (admin/club)
- **AI Integration**: Powered by Groq API with Llama 3 (FREE tier available)

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **AI**: Groq API (Llama 3)
- **Authentication**: JWT tokens with bcryptjs

## 📋 Prerequisites

- Node.js 18+ installed
- Groq API key (free at [groq.com](https://groq.com))

## ⚡ Quick Start

### 1. Clone and Install



```bash
cd leo-management
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Authentication  
NEXTAUTH_SECRET="change-this-to-a-random-secret-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Groq API (get your free key at groq.com)
GROQ_API_KEY="your-groq-api-key-here"
```

### 3. Set Up Database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Create Admin User

Open a new terminal and run:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "clubName": "System Admin",
    "role": "admin"
  }'
```

**Note**: You'll need to create the admin user through the API for the first time. After this, admins can create club accounts through the dashboard.

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

Login with:
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Change the admin password after first login!

## 🔑 Getting a Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys
4. Create a new API key
5. Add it to your `.env` file

The free tier is generous and should be sufficient for most Leo clubs.

## 📖 Usage

### For Admins

1. **Login** with admin credentials
2. **Create Club Accounts**:
   - Go to Admin Panel
   - Click "Create New Club"
   - Enter club name and contact email
   - System generates username and password
   - Share credentials with club

### For Club Users

1. **Login** with provided credentials
2. **Dashboard**: View all activities and quick actions
3. **Create Projects**: Use "New Project" with AI assistance for descriptions
4. **AI Project Consultant**: 
   - Describe your project idea in detail
   - Get AI suggestions for improvement
   - Learn how to align with award criteria
5. **Financial Records**: Track income/expenses
6. **Meetings**: Record minutes and attendance
7. **Events**: Plan and manage club events

## 🤖 AI Features

### 1. Form Filling Assistance
When creating project reports, the AI can suggest content for fields based on your project details and best practices.

### 2. AI Project Consultant (Highlighted Feature)
- Dedicated page for project ideation
- Describe your project idea
- AI analyzes against Leo values and award criteria
- Get specific improvement suggestions
- Receive actionable next steps

### 3. General Help Chat
Ask questions about using the app or Leo club management.

## 🗂️ Project Structure

```
leo-management/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── projects/     # Project CRUD
│   │   ├── financial/    # Financial records
│   │   ├── meetings/     # Meeting management
│   │   ├── events/       # Event management
│   │   └── ai/           # AI endpoints
│   ├── dashboard/        # Dashboard pages
│   ├── login/            # Login page
│   └── globals.css       # Global styles
├── lib/
│   ├── ai/               # AI integration
│   ├── auth.ts           # Auth utilities
│   ├── prisma.ts         # Database client
│   └── middleware.ts     # API middleware
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── package.json
```

## 🌐 Deploying to Production

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

**Important**: For production, use PostgreSQL instead of SQLite.

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
}
```

And update `prisma.config.ts` with your PostgreSQL connection URL.

### Option 2: Railway/Render

Similar steps - both support Next.js out of the box.

## 🔒 Security Notes

1. **Change default admin password** immediately after setup
2. **Use strong JWT secret** in production (not the example one)
3. **Use HTTPS** in production
4. **Rotate API keys** regularly
5. **Review club access** periodically

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT tokens | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `GROQ_API_KEY` | Groq API key for AI features | Yes |

## 🆘 Troubleshooting

**"Invalid token" errors**: Check that NEXTAUTH_SECRET is set correctly

**AI not working**: Verify GROQ_API_KEY is valid and has quota

**Database errors**: Run `npx prisma migrate reset` to reset database (dev only!)

**Port 3000 in use**: Change port with `npm run dev -- -p 3001`

## 📜 License

ISC

## 🤝 Support

For issues or questions, please create an issue in the repository.

---

**Built for Leo Clubs** 🦁 | **Powered by AI** 🤖 | **Open Source** 💙
