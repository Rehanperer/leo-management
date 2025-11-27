# Quick Setup Guide for Leo Management System

## ⚡ Fast Track Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
cd leo-management
npm install
```

### Step 2: Set Up Environment
Create a `.env` file with:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="change-this-secret-in-production"
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY="get-from-console.groq.com"
```

### Step 3: Initialize Database
```bash
npx prisma generate
npx prisma migrate deploy
```

### Step 4: Create Admin User
Run this Node.js script:
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
(async () => {
  const hash = await bcrypt.hash('admin123', 12);
  await prisma.user.create({
    data: { username: 'admin', password: hash, role: 'admin' }
  });
  console.log('✅ Admin created: username=admin, password=admin123');
  process.exit(0);
})();
"
```

### Step 5: Start the App
```bash
npm run dev
```

Visit **http://localhost:3000**

Login with:
- **Username**: admin
- **Password**: admin123

---

## 🎯 What You Can Do Now

1. **Admin Functions**:
   - Go to `/dashboard/admin`
   - Create club accounts
   - System generates secure passwords automatically

2. **AI Project Consultant** (⭐ Key Feature):
   - Go to `/dashboard/ai-consultant`
   - Describe your project idea
   - Get AI-powered improvement suggestions

3. **Create Projects**:
   - With AI form assistance
   - Track beneficiaries, service hours, participants

4. **Financial Management**:
   - Track income and expenses
   - Link to projects

5. **Meetings & Events**:
   - Record minutes and attendance
   - Plan and track events

---

## 🔑 Getting Your Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up (FREE)
3. Create new API key
4. Add to `.env` file

**Cost**: FREE tier is generous! Sufficient for most Leo clubs.

---

## 🚀 Deploy to Production (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository  
4. Add environment variables:
   - `DATABASE_URL` (use PostgreSQL for production)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `GROQ_API_KEY`
5. Deploy!

**For PostgreSQL**: Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
}
```

Then update `prisma.config.ts` with your PostgreSQL connection URL.

---

## 📝 Key Features

✅ Multi-club management with data isolation  
✅ AI-powered project consultation  
✅ Project, financial, meeting, event tracking  
✅ Auto-generated club passwords  
✅ Beautiful, modern UI with Leo branding  
✅ Free AI integration (Groq/Llama 3)  
✅ Production-ready for deployment  

---

## 🐛 Troubleshooting

**"Cannot find module @prisma/client"**:
```bash
npx prisma generate
```

**Port 3000 in use**:
```bash
npm run dev -- -p 3001
```

**AI not working**:
- Check GROQ_API_KEY in `.env`
- Restart dev server

---

## 📧 Support

Built for Leo Clubs 🦁 | Powered by AI 🤖

See `README.md` for full documentation.
