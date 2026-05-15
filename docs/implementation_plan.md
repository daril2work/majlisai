# MajlisAI v3.0 (React Vite Edition)

## Objective
Membangun platform agregator kajian nasional dengan fitur proximity search, AI validation (Salafy Gate), dan WhatsApp Ingestion menggunakan stack yang lebih stabil dan mudah dideploy.

## Tech Stack (Updated)
- **Frontend:** React + Vite (SPA) - Host di Netlify.
- **Backend/Logic:** Supabase Edge Functions (TypeScript) - Untuk Webhook Fonnte & AI Pipeline.
- **Database:** Supabase (PostgreSQL + PostGIS).
- **Styling:** Tailwind CSS 4.
- **AI:** Sumopod AI (OpenAI Compatible).

## Phase 1: Foundation (Current)
- [x] Inisialisasi React Vite Project.
- [ ] Setup Tailwind CSS 4 & Design System.
- [ ] Konfigurasi Supabase Client.
- [ ] Implementasi Sidebar & Navigation.

## Phase 2: Core Features
- [x] Event Feed dengan Proximity Search (PostGIS).
- [x] Map View (Leaflet).
- [ ] Event Details Page.

## Phase 3: Ingestion Engine (Edge Functions)
- [ ] Create Supabase Edge Function for WhatsApp Webhook.
- [ ] Implement Image Hashing & AI Extraction in Edge Function.

## Phase 4: PWA & Mobile Optimization
- [x] Implement Mobile-First Layout with Bottom Nav (FAB style).
- [x] Configure Vite-PWA and Manifest.
- [ ] Add Splash Screens and App Icons.
- [ ] Integrate Fonnte Webhook to Supabase.
