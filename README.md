# Source2BD: Multi-Vendor B2B Sourcing Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Stack](https://img.shields.io/badge/Stack-TanStack%20Start%20%7C%20React%20%7C%20TypeScript-blue.svg)](#technology-stack)
[![Database](https://img.shields.io/badge/Backend-Supabase%20PostgreSQL-green.svg)](#technology-stack)
[![Styling](https://img.shields.io/badge/UI-Tailwind%20CSS%20%2B%20Radix%20UI-38bdf8.svg)](#technology-stack)

**Source2BD** is a modern B2B wholesale marketplace web platform connecting enterprises, local manufacturers, and verified suppliers. Engineered with TanStack Start, TypeScript, and Supabase for real-time order tracking, RFQ (Request for Quotation) workflows, and catalog indexing.

---

## ⚡ Technology Stack

- **Framework**: TanStack Start / Vite / React 18
- **Language**: TypeScript (Strict typing)
- **State & Routing**: TanStack Router & Query
- **UI & Design**: Tailwind CSS, Radix UI Primitives, Lucide Icons
- **Backend & Auth**: Supabase (PostgreSQL with Row Level Security, Storage, Auth)

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    Client[React Browser Client] --> TanStack[TanStack Start SSR/CSR]
    TanStack --> SupabaseClient[Supabase JS Client]
    SupabaseClient --> DB[(PostgreSQL Database + RLS)]
    SupabaseClient --> Auth[Supabase Auth Engine]
    SupabaseClient --> Storage[Supabase S3 Buckets]
```

---

## 🚀 Setup & Local Development

### 1. Clone & Install Dependencies
```bash
git clone git@github.com:xtturan/source2bd.git
cd source2bd
bun install # or npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and provide your credentials:
```bash
cp .env.example .env
```
Fill in your Supabase project parameters:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### 3. Run Development Server
```bash
bun dev # or npm run dev
```
Open `http://localhost:3000` (or the configured Vite port) in your browser.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
