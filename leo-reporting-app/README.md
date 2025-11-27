# Leo Reporting Application

A comprehensive web application for Leo Clubs to simplify monthly reporting.

## Features

- **Authentication**: Admin-managed club accounts with secure JWT authentication
- **Project Reports**: Create detailed project reports with all required fields
  - Community details (Benefiting Community, Identified Need, Service Opportunity)
  - Project information (Title, Categories, Venue, Date)
  - Project leaders (Chairman, Secretary, Treasurer)
  - Metrics (Beneficiaries Count, Project Value, Service Hours, Participants)
  - Financial details (Income & Expenses per project)
  - File uploads (Images, Flyers, Attendance Proof, PR Proof, Expense Receipts)
  - PDF export functionality
- **Financial Reports**: Monthly treasurer reports
  - Income and expense tracking
  - Auto-calculated balance
  - PDF export functionality

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite + Sequelize
- **Authentication**: JWT
- **File Handling**: Multer
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

- Node.js (v14 or higher)

### Installation

1. Clone the repository
2. Install server dependencies:
   ```bash
   cd leo-reporting-app/server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   node index.js
   ```
   Server runs on http://localhost:5000

2. Start the frontend (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on http://localhost:5173

### First-Time Setup

1. Create an admin account to register club accounts:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123","clubName":"Admin","role":"admin"}'
   ```

2. Create a club account:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"clubname","password":"password123","clubName":"Leo Club Name","role":"club"}'
   ```

3. Login with the club credentials at http://localhost:5173

## Usage

1. **Login**: Use your club credentials
2. **Dashboard**: View all your project and financial reports
3. **Create Project Report**: Click "+ New Project" and fill in all details
4. **Upload Files**: Attach images, flyers, and proof documents
5. **Generate PDF**: After saving, click "Download PDF" to export
6. **Financial Reports**: Track monthly income and expenses
7. **Download**: Export reports as PDFs for submission

## Project Structure

```
leo-reporting-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── App.jsx        # Main app
│   └── package.json
├── server/                 # Express backend
│   ├── config/            # DB and Multer config
│   ├── models/            # Sequelize models
│   ├── controllers/       # Route controllers
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   └── index.js           # Server entry
└── database.sqlite        # SQLite database
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/financial` - Get all financial reports
- `POST /api/financial` - Create financial report
- `PUT /api/financial/:id` - Update financial report
- `DELETE /api/financial/:id` - Delete financial report

## License

ISC
