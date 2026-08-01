# GovSewana-AI

GovSewana-AI is a Next.js application for discoverability and booking of government-owned rest houses and circuit bungalows across Sri Lanka.

## Developer Quick Start Guide

Welcome! If you are a developer joining the team, follow these simple steps to set up your local workspace and connect to the existing database.

---

### Step-by-Step Setup

#### 1. Clone the repository and install dependencies
```bash
npm install
```

#### 2. Configure Environment Variables
Since `.env` is ignored by Git, you will need to set it up locally:
1. Copy the `.env.example` file to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```
2. Populate the `.env` file with the shared database connection strings (ask the team/administrator for the credentials).

#### 3. Generate the Prisma Client
You **must** generate the local Prisma Client types inside your `node_modules` so TypeScript can resolve them:
```bash
npx prisma generate
```

#### 4. Start the Development Server
You do **not** need to run database pushes or seeds since the shared database is already set up and populated. Simply run:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view and interact with the application.

---

### Advanced / New Database Setup (Optional)

If you are setting up a brand new/private database and need to initialize it from scratch:

1. **Push the Schema:** Pushes the tables and relations defined in `schema.prisma` directly to your database:
   ```bash
   npx prisma db push
   ```
2. **Seed Initial Data:** Populates your database with test users, bungalows, rooms, and bookings:
   ```bash
   npx prisma db seed
   ```

#### Seeding Accounts Reference
When the database is seeded, the following test users are created:

| Name | Username | Password | Role |
| :--- | :--- | :--- | :--- |
| **Super Admin User** | `superadmin` | `adminpassword123` | `SUPER_ADMIN` |
| **Department Admin** | `deptadmin` | `deptpassword123` | `DEPT_ADMIN` |
| **Nimal Fernando** | `nimal_fernando` | `nimalpassword123` | `GOV_EMPLOYEE` |
| **Suresh Perera** | `suresh_perera` | `sureshpassword123` | `PUBLIC_USER` |
