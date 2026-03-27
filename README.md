# TickFlow – Professional Ticketing System

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel)](https://vercel.com)

A modern, full-featured ticketing system built with **React**, **TypeScript**, and **Supabase**.  
Designed for teams to track tasks, manage projects, and collaborate efficiently.

🔗 **Live Demo:** *Coming soon on Vercel*  
📁 **Repository:** [iacreatorcar/TaskFlow](https://github.com/iacreatorcar/TaskFlow)

---

## 📑 Table of Contents

- [Features](#-features)
- [Modules & Technologies](#-modules--technologies)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Author](#-author)
- [License](#-license)

---

## 🚀 Features

| Area | Features |
|------|----------|
| **🔐 Authentication** | Email/password, OAuth (Google, GitHub) |
| **📁 Projects** | Create, edit, archive, color coding |
| **🎫 Tickets** | Title, description, priority, type, due date, assignments |
| **📋 Kanban Board** | Drag & drop between todo / in-progress / done |
| **💬 Comments** | Threaded discussions with @mentions |
| **🔔 Notifications** | Real-time + email (Resend ready) |
| **👥 Team Management** | Roles: Admin, Developer, Tester, Viewer |
| **📊 Dashboard** | Statistics, charts, activity feed |
| **📎 File Attachments** | Upload files to tickets (Supabase Storage) |

---

## 📦 Modules & Technologies

### Frontend

| Module | Version | Description |
|--------|---------|-------------|
| React | 18.2.0 | UI library |
| TypeScript | 5.0.0 | Type safety |
| Vite | 5.0.0 | Build tool |
| Tailwind CSS | 3.4.0 | Utility-first CSS |
| shadcn/ui | Latest | Reusable UI components |
| Recharts | 2.12.0 | Charts and statistics |
| @hello-pangea/dnd | 16.6.0 | Drag & drop for Kanban |
| Zustand | 4.5.0 | State management |
| React Router DOM | 6.22.0 | Navigation |
| React Hook Form | 7.51.0 | Form management |
| Zod | 3.22.0 | Data validation |

### Backend (Supabase)

| Module | Description |
|--------|-------------|
| PostgreSQL | Relational database |
| Auth (GoTrue) | JWT authentication |
| Realtime | WebSocket for live updates |
| Storage | File and avatar uploads |
| Edge Functions | Serverless functions (Deno) |

### Deployment

| Platform | Role |
|----------|------|
| Vercel | Frontend hosting |
| Supabase Cloud | Backend and database hosting |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL (Frontend)                        │
│                 React + TypeScript + Tailwind                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                     ▼  HTTPS / WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                       SUPABASE (Backend)                        │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐   │
│  │  PostgreSQL │   │    Auth     │   │      Storage        │   │
│  │  Database   │   │   (JWT)     │   │  (File / Avatar)    │   │
│  └─────────────┘   └─────────────┘   └─────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          Edge Functions (Email + Webhook)               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- npm or yarn
- Free Supabase account ([supabase.com](https://supabase.com))

### 1. Clone the repository

```bash
git clone https://github.com/iacreatorcar/TaskFlow.git
cd TaskFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `RESEND_API_KEY` | Optional: for email via Resend |

---

## 📁 Project Structure

```
TaskFlow/
├── src/
│   ├── components/          # React components
│   │   ├── board/           # Kanban board with drag & drop
│   │   ├── dashboard/       # Charts and statistics
│   │   ├── layout/          # Navigation, sidebar
│   │   ├── ticket/          # Ticket detail, comments
│   │   └── views/           # Projects, settings, team
│   ├── hooks/               # Custom hooks (useAuth, useProjects, useTickets)
│   ├── lib/                 # Supabase client and utilities
│   ├── types/               # TypeScript definitions
│   ├── store/               # Zustand store
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/          # Database schema (001_initial_schema.sql)
│   └── functions/           # Edge Functions (send-email, webhooks)
├── public/
├── .env.example
├── docker-compose.yml       # Local Supabase with Docker
├── vercel.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 📸 Screenshots

> Images will be added after the Vercel deployment.

| Dashboard | Kanban Board |
|-----------|--------------|
| Coming soon | Coming soon |

| Ticket Detail | Team Management |
|---------------|-----------------|
| Coming soon | Coming soon |

---

## 👨‍💻 Author

**Carmine D'Alise** — Digital System Developer

- 🌐 Website: [cdalise.com](https://cdalise.com)
- 📁 Portfolio: [cdalise.com/progetti](https://cdalise.com/progetti)
- 🐙 GitHub: [iacreatorcar](https://github.com/iacreatorcar)

> This project was developed for real team collaboration and ticketing needs in production environments.

---

## 📄 License

This work is licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).

**You are free to:**
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material

**Under the following terms:**
- **Attribution** — You must give appropriate credit to the author (Carmine D'Alise), provide a link to the license, and indicate if changes were made.
- **NonCommercial** — You may not use the material for commercial purposes.

🔗 [https://creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/)

---

<p align="center">
  Made with ❤️ using React + Supabase + Vercel<br>
  © Carmine D'Alise – <a href="https://cdalise.com">cdalise.com</a>
</p>