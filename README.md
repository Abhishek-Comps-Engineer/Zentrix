# Avieno - Software Company Platform

A complete, production-ready full-stack application built for a software development agency. Features public landing pages, client request dashboards, and an admin management panel.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI + Framer Motion
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: Custom JWT Auth + HTTP-only Cookies
- **Forms**: React Hook Form + Zod

## 📦 Setup & Installation

### 1. Clone the repository and install dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file based on the `.env.example` template:

```bash
cp .env.example .env
```
Make sure to put your actual PostgreSQL `DATABASE_URL` and a secure `JWT_SECRET`.

### 3. Initialize the Database

Push the Prisma schema to your database and generate the Prisma client:

```bash
npx prisma db push
npx prisma generate
```

*(Note: In production, consider using `npx prisma migrate deploy` after creating migrations with `npx prisma migrate dev`)*

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- `/src/app/api`: Next.js REST API routes.
- `/src/app/(admin)`: Protected admin dashboard.
- `/src/app/(protected)`: Protected client dashboard.
- `/src/components`: Reusable UI components from Shadcn UI & custom components.
- `/prisma`: Database schema and migrations.

## 🐳 Docker Deployment

The project includes a multi-stage `Dockerfile` optimized for Next.js standalone output.

To build the Docker image:

```bash
docker build -t avieno-platform .
```

To run the container:

```bash
docker run -p 3000:3000 -e DATABASE_URL="your-db-url" -e JWT_SECRET="your-secret" avieno-platform
```

*(Note: Make sure to update your `next.config.mjs` to set `output: 'standalone'` if using the Dockerfile).*
