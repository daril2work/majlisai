# Code Audit Report — MajlisAI v3.0
_Audit Date: 2026-05-14 | Refactoring Completed: 2026-05-14_

---

## 📊 Executive Summary

| Kategori | Sebelum | Sesudah |
|---|---|---|
| God Class | ✅ Tidak ada | ✅ Tidak ada |
| God Config | ⚠️ Minor | ✅ Diperbaiki |
| Type Safety | ⚠️ Lemah | ✅ Strict mode aktif |
| Code Smell | ⚠️ 8 temuan | ✅ Semua diselesaikan |
| Modularity | ⚠️ Kurang | ✅ Direfactor |
| Tech Debt | 🔴 Signifikan | ✅ Diselesaikan |
| Error Handling | 🔴 Kurang lengkap | ✅ Diperbaiki |
| DX / Tooling | 🔴 Tidak ada | ✅ ESLint aktif |

---

## 🔍 Temuan & Perbaikan Per File

### `tsconfig.json`

| # | Smell | Severity | Status |
|---|---|---|---|
| 1 | `strict: true` belum aktif | HIGH | ✅ FIXED |
| 2 | `erasableSyntaxOnly` konflik dengan strict | MEDIUM | ✅ REMOVED |

**Perubahan:**
```diff
- "erasableSyntaxOnly": true,
+ "strict": true,
```

---

### `src/lib/supabase.ts` → Dipisah ke `src/types/event.ts`

| # | Smell | Severity | Status |
|---|---|---|---|
| 3 | `Event` type dicampur dengan infrastruktur | MEDIUM | ✅ FIXED |
| 4 | `date/time` tidak sinkron dengan DB (`starts_at`) | HIGH | ✅ FIXED |

**Perubahan:**
- `Event` type dipindah ke `src/types/event.ts`
- Kolom `date: string; time: string` → `starts_at: string`
- Ditambah `EventStatus` dan `EventSource` union types
- Ditambah `EventDraft` type untuk form/upload use case
- `supabase.ts` kini hanya berisi inisialisasi client (Single Responsibility)

---

### `src/hooks/useEvents.ts`

| # | Smell | Severity | Status |
|---|---|---|---|
| 5 | `let query` implicit `any` | HIGH | ✅ FIXED |
| 6 | `err: any` di catch block | HIGH | ✅ FIXED |
| 7 | `fetchEvents` tidak di-memoize (`useCallback`) | MEDIUM | ✅ FIXED |
| 8 | Tidak ada `AbortController` → memory leak | HIGH | ✅ FIXED |

**Perubahan:**
- `let data: Event[] | null = null` — explicit typing
- `catch (err: unknown)` + `err instanceof Error` check
- `fetchEvents` dibungkus `useCallback`
- Effect menggunakan `AbortController` + cleanup `abort()` saat unmount
- `refetch()` dipublikasi sebagai stable callback

---

### `src/hooks/useGeolocation.ts` _(File Baru)_

| # | Smell | Severity | Status |
|---|---|---|---|
| 9 | Geolocation logic campur di halaman Feed | MEDIUM | ✅ EXTRACTED |

**Perubahan:**
- Dibuat `src/hooks/useGeolocation.ts` dengan interface `Coordinates` dan `GeolocationStatus`
- Menangani browser compatibility, timeout (10s), dan cache (60s)
- Mengembalikan `{ coords, status, error }` — granular state untuk UI

---

### `src/pages/Feed.tsx`

| # | Smell | Severity | Status |
|---|---|---|---|
| 10 | Geolocation inline di komponen | MEDIUM | ✅ FIXED |
| 11 | `window.location.reload()` untuk retry | MEDIUM | ✅ FIXED |
| 12 | Empty state inline JSX | LOW | ✅ FIXED |

**Perubahan:**
- Menggunakan `useGeolocation()` hook
- Retry menggunakan `refetch()` dari `useEvents`
- Empty state menggunakan komponen `<EmptyState>`
- Toast hanya ditampilkan saat `geoStatus` berubah (via `useEffect`)

---

### `src/components/Layout.tsx`

| # | Smell | Severity | Status |
|---|---|---|---|
| 13 | Duplikasi `navItems.map()` di sidebar dan mobile | MEDIUM | ✅ FIXED |
| 14 | Settings/Logout tanpa handler (dead code) | LOW | ✅ MARKED TODO |

**Perubahan:**
- Ekstrak komponen `<NavItem variant="sidebar" | "mobile">` yang reusable
- `NAV_ROUTES` bertipe `NavRoute[]` — type-safe
- Fungsi `isActive()` terpusat menggantikan ternary tersebar
- Tambah `z-50` pada mobile nav agar tidak tertimpa konten

---

### `src/components/EventCard.tsx`

| # | Smell | Severity | Status |
|---|---|---|---|
| 15 | Format tanggal/jarak inline di JSX | MEDIUM | ✅ FIXED |
| 16 | `event.date` tidak sinkron dengan DB | HIGH | ✅ FIXED |
| 17 | Image tanpa `loading="lazy"` | LOW | ✅ FIXED |
| 18 | Share button tanpa `aria-label` | LOW | ✅ FIXED |

**Perubahan:**
- `formatEventDate()`, `formatEventTime()`, `formatDistance()` dari `src/lib/formatters.ts`
- `event.date` → `event.starts_at`
- `onDetail` callback prop (tidak hardcode navigate)
- `loading="lazy"` pada `<img>`
- `aria-label="Bagikan"` pada share button

---

### `src/lib/formatters.ts` _(File Baru)_

Pure utility functions tanpa React dependency, mudah di-unit test secara independen:

| Fungsi | Deskripsi |
|---|---|
| `formatEventDate(iso)` | Tanggal Indonesia: "Sabtu, 14 Mei 2026" |
| `formatEventTime(iso)` | Waktu: "19:30 WIB" |
| `formatDistance(meters)` | Jarak: "1.5 KM" atau "800 M" |
| `clamp(val, min, max)` | Numeric clamping utility |

---

### `src/App.tsx`

| # | Smell | Severity | Status |
|---|---|---|---|
| 19 | Inline `<div>Coming Soon</div>` di routes | LOW | ✅ FIXED |

**Perubahan:** Routes menggunakan `<ComingSoon feature="Nama Fitur" />`

---

### `src/pages/ComingSoon.tsx` _(File Baru)_
Komponen placeholder reusable dengan icon Hammer dan nama fitur yang bisa dikustomisasi.

### `src/components/EmptyState.tsx` _(File Baru)_
Komponen reusable untuk state kosong, menerima `icon`, `title`, `description`, dan `action`.

---

### `package.json` + `eslint.config.js`

| # | Debt | Status |
|---|---|---|
| 20 | Tidak ada `lint` script | ✅ FIXED |
| 21 | Tidak ada TypeScript check CI gate | ✅ FIXED |
| 22 | ESLint tidak terkonfigurasi | ✅ FIXED |

**Script baru:**
```bash
npm run lint        # ESLint dengan 0 warning tolerance
npm run type-check  # tsc tanpa emit (CI gate)
```

**Rules ESLint yang ditambahkan:**
- `@typescript-eslint/no-explicit-any: error` — tidak boleh bypass type safety
- `@typescript-eslint/no-unused-vars: error` — kode bersih
- `no-console: warn` — debug log tidak masuk production

---

## 📁 Struktur File Setelah Refactoring

```
src/
├── App.tsx                       ✅ Clean router
├── main.tsx
├── index.css
├── types/
│   └── event.ts                  🆕 Domain types
├── lib/
│   ├── supabase.ts               ✅ Infra only
│   └── formatters.ts             🆕 Pure utilities
├── hooks/
│   ├── useEvents.ts              ✅ Refactored
│   └── useGeolocation.ts         🆕 Extracted
├── components/
│   ├── Layout.tsx                ✅ DRY NavItem
│   ├── EventCard.tsx             ✅ Uses formatters
│   └── EmptyState.tsx            🆕 Reusable
└── pages/
    ├── Feed.tsx                  ✅ SRP compliant
    └── ComingSoon.tsx            🆕 Reusable placeholder
```

---

## ✅ Checklist Perbaikan

### Priority 1 — Security & Correctness
- [x] Tambah `strict: true` ke tsconfig.json
- [x] Sinkronkan `Event` type: ganti `date/time` → `starts_at`
- [x] Pindahkan `Event` type ke `src/types/event.ts`

### Priority 2 — Architecture
- [x] Ekstrak `useGeolocation` hook
- [x] Bungkus `fetchEvents` dengan `useCallback` + tambah `AbortController`
- [x] Hilangkan duplikasi NavItem di Layout.tsx
- [x] Buat `src/lib/formatters.ts` untuk date & distance

### Priority 3 — DX & Code Quality
- [x] Setup ESLint + scripts
- [x] Buat `ComingSoon.tsx` dan `EmptyState.tsx`
- [x] Hubungkan error retry ke `refetch()` bukan `window.reload()`

### Remaining (Future Scope)
- [ ] Unit tests untuk `formatters.ts` (Jest/Vitest)
- [ ] Hapus `framer-motion` & `tailwind-merge` jika tidak dipakai
- [ ] Hubungkan Settings/Logout ke auth context
- [ ] Implementasi `onDetail` handler (navigate to `/events/:id`)
