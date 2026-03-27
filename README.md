# TaskFlow - Sistema di Ticketing Completo

[![TaskFlow](https://img.shields.io/badge/TaskFlow-v2.0-blue)](https://taskflow.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel)](https://vercel.com)

> **Sistema di ticketing professionale** con board Kanban, gestione progetti, team collaboration, notifiche real-time e molto altro.

**Creato da D'Alise Carmine Digital System**

![TaskFlow Dashboard](https://via.placeholder.com/800x400?text=TaskFlow+Dashboard)

---

## 📑 Indice

- [Architettura](#-architettura)
- [Caratteristiche](#-caratteristiche)
- [Tecnologie](#-tecnologie)
- [Quick Start](#-quick-start)
- [Configurazione Supabase](#-configurazione-supabase)
- [Configurazione Email](#-configurazione-email)
- [Deploy](#-deploy)
- [Struttura Progetto](#-struttura-progetto)
- [API Reference](#-api-reference)
- [Contribuire](#-contribuire)

---

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL (Frontend)                        │
│                    React + TypeScript + Tailwind                 │
│                         taskflow.vercel.app                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS / WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (Backend)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  PostgreSQL │  │    Auth     │  │      Storage            │  │
│  │  Database   │  │   (JWT)     │  │   (File/Avatar)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Edge Functions (Email + Webhook)               │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Caratteristiche

### 🎯 Core
- **🔐 Autenticazione Completa** - Email/password, OAuth (Google, GitHub, GitLab)
- **📋 Board Kanban** - Drag & drop con stati personalizzabili
- **📁 Gestione Progetti** - Progetti multipli con membri e permessi
- **🎫 Ticket System** - Tipi, priorità, assegnazioni, scadenze
- **💬 Commenti** - Discussione sui ticket con menzioni (@username)
- **🔔 Notifiche** - Real-time e email
- **📊 Dashboard** - Statistiche e report

### 👥 Team
- **Ruoli Utente** - Admin, Developer, Tester, Viewer
- **Permessi Granulari** - Row Level Security (RLS)
- **Avatar & Profili** - Upload immagini

### 📎 File
- **Allegati** - Upload file sui ticket
- **Storage** - Gestione file con Supabase Storage

### 📧 Email
- **Template Email** - Personalizzabili
- **Notifiche Email** - Ticket assegnati, menzioni, scadenze
- **Provider** - Resend (configurabile)

---

## 🛠️ Tecnologie

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componenti UI
- **@hello-pangea/dnd** - Drag & Drop
- **Recharts** - Grafici

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Auth (GoTrue)
  - Realtime
  - Storage
  - Edge Functions (Deno)

### Deploy
- **Vercel** - Frontend Hosting
- **Supabase Cloud** - Backend Hosting

---

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+
- npm o yarn
- Account [Supabase](https://supabase.com)
- (Opzionale) Account [Resend](https://resend.com) per email

### 1. Clona il Repository

```bash
git clone https://github.com/tuousername/taskflow.git
cd taskflow
```

> **Nome repository consigliato:** `taskflow` o `taskflow-ticketing`

### 2. Installa Dipendenze

```bash
npm install
```

### 3. Configura Variabili d'Ambiente

```bash
cp .env.example .env
```

Modifica `.env` con i tuoi valori:

```env
VITE_SUPABASE_URL=https://tuo-progetto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Avvia in Sviluppo

```bash
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173)

---

## ⚙️ Configurazione Supabase

### 1. Crea Progetto Supabase

1. Vai su [app.supabase.com](https://app.supabase.com)
2. Clicca "New Project"
3. Inserisci nome: `taskflow`
4. Scegli regione (consigliato: più vicina ai tuoi utenti)
5. Clicca "Create new project"

### 2. Esegui Migrations

#### Opzione A: SQL Editor (Consigliato per iniziare)

1. Nel progetto Supabase, vai su "SQL Editor"
2. Clicca "New query"
3. Copia il contenuto di `supabase/migrations/001_initial_schema.sql`
4. Clicca "Run"

#### Opzione B: Supabase CLI (Per sviluppo avanzato)

```bash
# Installa Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al progetto
supabase link --project-ref tuo-project-ref

# Applica migrations
supabase db push
```

### 3. Configura Storage Buckets

1. Vai su "Storage" nel dashboard Supabase
2. Crea bucket `profiles` (public)
3. Crea bucket `attachments` (public)

### 4. Configura Auth

1. Vai su "Authentication" > "Settings"
2. Configura Site URL: `http://localhost:5173` (dev) o il tuo dominio Vercel
3. (Opzionale) Abilita OAuth providers (Google, GitHub)

### 5. Ottieni API Keys

1. Vai su "Project Settings" > "API"
2. Copia:
   - `URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`

---

## 📧 Configurazione Email

### 1. Registrati su Resend

1. Vai su [resend.com](https://resend.com)
2. Crea account gratuito (100 email/giorno)
3. Verifica dominio o usa dominio di test
4. Crea API key

### 2. Configura in Supabase

1. Vai su "Edge Functions" nel dashboard
2. Clicca "Deploy function"
3. Deploy `supabase/functions/send-email`
4. Aggiungi variabile d'ambiente:
   - `RESEND_API_KEY` = la tua API key

### 3. Email Dipendenti

Crea email dedicate per i dipendenti:

```
mario.rossi@tua-azienda.com → Ruolo: Admin
dev1@tua-azienda.com → Ruolo: Developer
dev2@tua-azienda.com → Ruolo: Developer
tester@tua-azienda.com → Ruolo: Tester
```

I template email sono in `supabase/migrations/001_initial_schema.sql` (tabella `email_templates`).

---

## 🚀 Deploy

### Deploy Frontend su Vercel

#### 1. Prepara Repository

```bash
# Inizializza git
git init
git add .
git commit -m "Initial commit"

# Crea repository su GitHub
git remote add origin https://github.com/tuousername/taskflow.git
git push -u origin main
```

> **Nome repository GitHub consigliato:** `taskflow`

#### 2. Deploy su Vercel

1. Vai su [vercel.com](https://vercel.com)
2. Clicca "Add New Project"
3. Importa da GitHub
4. Seleziona il repository `taskflow`
5. Configura:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Aggiungi Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Clicca "Deploy"

#### 3. Configura Dominio (Opzionale)

1. In Vercel, vai su "Settings" > "Domains"
2. Aggiungi il tuo dominio personalizzato
3. Segui le istruzioni per configurare DNS

### Deploy Backend (Già su Supabase)

Il backend è già hostato su Supabase Cloud. Per aggiornare:

```bash
# Deploy Edge Functions
supabase functions deploy send-email
supabase functions deploy webhook-notifications
```

---

## 📁 Struttura Progetto

```
taskflow/
├── src/
│   ├── components/          # Componenti React
│   │   ├── board/          # Board Kanban
│   │   ├── dashboard/      # Dashboard statistiche
│   │   ├── layout/         # Layout e navigazione
│   │   ├── ticket/         # Componenti ticket
│   │   └── views/          # Viste principali
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Autenticazione
│   │   ├── useProjects.ts  # Gestione progetti
│   │   └── useTickets.ts   # Gestione ticket
│   ├── lib/                # Librerie e utility
│   │   └── supabase.ts     # Client Supabase
│   ├── types/              # TypeScript types
│   │   ├── index.ts        # Tipi applicazione
│   │   └── supabase.ts     # Tipi database
│   ├── App.tsx             # Entry point
│   └── main.tsx            # Bootstrap
├── supabase/
│   ├── migrations/          # Database migrations
│   │   └── 001_initial_schema.sql
│   ├── functions/           # Edge Functions
│   │   ├── send-email/     # Invio email
│   │   └── webhook-notifications/
│   └── config.toml         # Configurazione Supabase
├── public/                  # Asset statici
├── .env.example            # Template variabili
├── docker-compose.yml      # Docker per locale
├── vercel.json             # Configurazione Vercel
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📚 API Reference

### Autenticazione

```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, signIn, signUp, signOut } = useAuth();

// Login
await signIn('user@example.com', 'password');

// Registrazione
await signUp('user@example.com', 'password', { name: 'Mario' });

// Logout
await signOut();
```

### Progetti

```typescript
import { useProjects } from '@/hooks/useProjects';

const { projects, createProject, updateProject } = useProjects();

// Crea progetto
await createProject({
  name: 'Nuovo Progetto',
  key: 'PROJ',
  description: 'Descrizione...',
  color: '#3B82F6',
}, ownerId);
```

### Ticket

```typescript
import { useTickets } from '@/hooks/useTickets';

const { tickets, createTicket, moveTicket } = useTickets();

// Crea ticket
await createTicket({
  project_id: '...',
  title: 'Nuovo Ticket',
  status: 'todo',
  priority: 'high',
  type: 'feature',
  reporter_id: '...',
});

// Sposta ticket
await moveTicket(ticketId, 'in_progress', 0);
```

---

## 🔧 Comandi Utili

```bash
# Sviluppo
npm run dev              # Avvia server sviluppo
npm run build            # Build produzione
npm run preview          # Preview build locale

# Supabase (locale)
supabase start           # Avvia Supabase locale
supabase stop            # Ferma Supabase locale
supabase db reset        # Reset database
supabase functions serve # Test functions localmente

# Docker
docker-compose up -d     # Avvia con Docker
docker-compose down      # Ferma Docker
```

---

## 🐳 Docker (Locale)

Per eseguire l'app in locale con Docker:

```bash
# Build e avvia
docker-compose up -d --build

# App disponibile su http://localhost:3000

# Ferma
docker-compose down
```

---

## 📝 Roadmap

- [x] Autenticazione completa
- [x] Board Kanban con drag & drop
- [x] Gestione progetti e team
- [x] Notifiche real-time
- [x] Email notifications
- [ ] Sprint/Iterazioni
- [ ] Burndown chart
- [ ] Time tracking
- [ ] API REST pubblica
- [ ] Mobile app (React Native)
- [ ] Integrazioni (Slack, GitHub)

---

## 🤝 Contribuire

1. Fork il repository
2. Crea branch: `git checkout -b feature/nuova-feature`
3. Commit: `git commit -am 'Aggiungi nuova feature'`
4. Push: `git push origin feature/nuova-feature`
5. Apri Pull Request

---

## 📄 Licenza

MIT License - Vedi [LICENSE](LICENSE)

---

## 💬 Supporto

- 📧 Email: support@taskflow.app
- 💬 Discord: [Unisciti al server](https://discord.gg/taskflow)
- 🐛 Issues: [GitHub Issues](https://github.com/tuousername/taskflow/issues)

---

<p align="center">
  Fatto con ❤️ usando <strong>React</strong> + <strong>Supabase</strong> + <strong>Vercel</strong>
</p>

<p align="center">
  <strong>Creato da D'Alise Carmine Digital System</strong>
</p>
