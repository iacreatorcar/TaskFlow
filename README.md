# TickFlow – Professional Ticketing System

A modern, full-featured ticketing system built with React, TypeScript, and Supabase.  
Designed for teams to track tasks, manage projects, and collaborate efficiently.

🔗 **Live Demo:** *Coming soon on Vercel*  
📁 **Repository:** [iacreatorcar/TaskFlow](https://github.com/iacreatorcar/TaskFlow)

---

## 📑 Indice

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Screenshots & Dynamics](#-screenshots--dynamics)
- [Author](#-author)
- [License](#-license)

---

## 🚀 Features

| Area | Features |
|------|----------|
| **Authentication** | Email/password, OAuth ready (Google, GitHub) |
| **Projects** | Create, edit, archive, color coding |
| **Tickets** | Title, description, priority, type, due date, assignments |
| **Kanban Board** | Drag & drop between todo/in-progress/done |
| **Comments** | Threaded discussions with @mentions |
| **Notifications** | Real-time + email (Resend ready) |
| **Team Management** | Roles: Admin, Developer, Tester, Viewer |
| **Dashboard** | Statistics, charts, activity feed |
| **File Attachments** | Upload files to tickets (Supabase Storage) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| **Deployment** | Vercel (frontend), Supabase Cloud (backend) |
| **Email** | Resend API (optional) |

---

## 🏗️ Architecture
┌─────────────────────────────────────────────────────────────────┐
│ VERCEL (Frontend) │
│ React + TypeScript + Tailwind │
└─────────────────────────────────────────────────────────────────┘
│
▼ HTTPS / WebSocket
┌─────────────────────────────────────────────────────────────────┐
│ SUPABASE (Backend) │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│ │ PostgreSQL │ │ Auth │ │ Storage │ │
│ │ Database │ │ (JWT) │ │ (File/Avatar) │ │
│ └─────────────┘ └─────────────┘ └─────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Edge Functions (Email + Webhook) │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘


---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free)

### 1. Clone the repository

```bash
git clone https://github.com/iacreatorcar/TaskFlow.git
cd TaskFlow

2. Install dependencies
bash
npm install
3. Set up environment variables
bash
cp .env.example .env
Edit .env with your Supabase credentials.

4. Start development server
bash
npm run dev
Open http://localhost:5173

🔧 Environment Variables
Variable	Description
VITE_SUPABASE_URL	Your Supabase project URL
VITE_SUPABASE_ANON_KEY	Your Supabase anon/public key
RESEND_API_KEY	Optional: for email notifications
📁 Project Structure
text
TaskFlow/
├── src/
│   ├── components/          # React components
│   │   ├── board/          # Kanban board with drag & drop
│   │   ├── dashboard/      # Charts and statistics
│   │   ├── layout/         # Navigation, sidebar
│   │   ├── ticket/         # Ticket detail, comments
│   │   └── views/          # Projects, settings, team
│   ├── hooks/              # Custom hooks (useAuth, useProjects, useTickets)
│   ├── lib/                # Supabase client & utilities
│   ├── types/              # TypeScript definitions
│   ├── store/              # Zustand store
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/         # Database schema (001_initial_schema.sql)
│   └── functions/          # Edge Functions (send-email, webhooks)
├── public/
├── .env.example
├── docker-compose.yml      # Local Supabase with Docker
├── vercel.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
📸 Screenshots & Dynamics
Dashboard
Overview of projects, tickets, and team activity.

Kanban Board
Drag & drop tickets between columns. Real-time updates.

Ticket Detail
Full ticket view with comments, attachments, and activity log.

Project Settings
Manage project members, colors, and permissions.

Team Management
Invite team members and assign roles (Admin, Developer, Tester).

Screenshots will be added after deployment. Live demo available on Vercel.

👨‍💻 Author
Carmine D'Alise
Digital System Developer

🌐 Website: cdalise.com

📁 Project section: cdalise.com/progetti

🐙 GitHub: iacreatorcar

This project was developed as part of real‑world team collaboration workflows and production‑ready ticketing needs.

📄 License
This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.

You are free to:

Share — copy and redistribute the material in any medium or format

Adapt — remix, transform, and build upon the material

Under the following terms:

Attribution — You must give appropriate credit to the author (Carmine D'Alise), provide a link to the license, and indicate if changes were made.

NonCommercial — You may not use the material for commercial purposes.

🔗 https://creativecommons.org/licenses/by-nc/4.0/

<p align="center"> Made with ❤️ using React + Supabase + Vercel<br> © Carmine D'Alise – <a href="https://cdalise.com">cdalise.com</a> </p> ```