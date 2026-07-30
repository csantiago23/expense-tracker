# Modern Expense Tracker - Personal Finance Application

A production-grade, full-stack personal finance and expense tracking application built with **React 18**, **TypeScript**, **TailwindCSS**, **Node.js**, **Express**, **Prisma ORM**, **SQLite**, **JWT Authentication**, and **Recharts**.

---

## Key Features

- **Dashboard**: Live total balance across accounts, monthly income, monthly expenses, net savings, 6-month trends, category distribution pie charts, recent transactions, upcoming bill reminders, budget progress bars, and savings goals.
- **Transactions**: Full CRUD for transactions (Income, Expense, Transfer) with filtering by account/category/date/type/payment method, global search, tags, receipt attachment upload (Multer), and undo-delete support.
- **Accounts**: Multi-account manager supporting Checking, Savings, Cash, Credit Card, and Investment accounts with live balance tracking.
- **Categories**: Custom categories with assigned colors and icons.
- **Budgets**: Category-based monthly budgets with progress indicators and automatic visual warnings at 75%, 90%, and 100%+ capacity.
- **Bills & Reminders**: Due date tracker with late status badges, reminder days, auto-pay flags, and mark-as-paid toggles.
- **Savings Goals**: Milestone progress rings and bars, target deadlines, and quick contribution deposit modals.
- **Reports & Analytics**: 12-month cash flow bar charts, category spending breakdown, CSV export, and full JSON backup/restore.
- **Settings & Theme**: Light and Dark Mode switcher, currency options (USD, EUR, GBP, CAD, AUD, JPY), date format preferences, and user profile management.
- **Security**: JWT authentication, bcrypt password hashing, input validation via Zod, security headers via Helmet, and rate limiting.

---

## Tech Stack

### Backend (`/server`)
- **Runtime**: Node.js & Express (`TypeScript`)
- **Database**: SQLite (via Prisma ORM) with seamless PostgreSQL support
- **Auth**: JWT (`jsonwebtoken`) & `bcryptjs`
- **File Uploads**: `multer`
- **Validation**: `zod`
- **Testing**: `vitest` + `supertest`

### Frontend (`/client`)
- **Framework**: React 18 + Vite (`TypeScript`)
- **Styling**: TailwindCSS with CSS custom properties (Dark/Light themes, Glassmorphism, animations)
- **Data Fetching & State**: TanStack React Query + React Context (Auth, Theme)
- **Charts**: Recharts
- **Icons**: Lucide React

---

## Project Structure

```
Expense Tracker/
├── client/                      # Frontend Vite + React application
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Sidebar, Modal, Card, Skeleton)
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── pages/              # Dashboard, Transactions, Accounts, Categories, Budgets, Bills, Goals, Reports, Settings, Login, Register
│   │   ├── services/           # Axios API client
│   │   ├── types/              # TypeScript interface definitions
│   │   ├── App.tsx             # Protected routes layout
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Tailwind design tokens & dark theme
│   ├── package.json
│   └── vite.config.ts
├── server/                      # Backend Express API server
│   ├── prisma/
│   │   ├── schema.prisma       # Normalized database schema
│   │   └── seed.ts             # Seed script with demo data
│   ├── src/
│   │   ├── config/             # Environment & app configuration
│   │   ├── controllers/        # REST API controllers
│   │   ├── middleware/         # Auth, validation, error handler
│   │   ├── routes/             # Express API routes
│   │   ├── tests/              # Vitest + Supertest integration tests
│   │   ├── utils/              # Multer uploader, default seed helpers
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # Server entry point
│   └── package.json
└── README.md
```

---

## Environment Variables

### Backend (`/server/.env`)
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="expense_tracker_jwt_secret_key_production_2026_super_secure"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Backend Setup
```bash
cd server
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```
The server will start on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### 3. Demo Credentials
- **Email**: `demo@expensetracker.com`
- **Password**: `password123`

---

## Running Tests

### Backend Integration Tests
```bash
cd server
npm run test
```

---

## Database Entity Relationship Overview

- **User** 1 : N **Account**
- **User** 1 : N **Category**
- **User** 1 : N **Transaction**
- **User** 1 : N **Budget**
- **User** 1 : N **Bill**
- **User** 1 : N **SavingsGoal**
- **User** 1 : N **RecurringTransaction**
- **User** 1 : N **Notification**
- **Account** 1 : N **Transaction**
- **Category** 1 : N **Transaction**
