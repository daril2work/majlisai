# Audit Report 2 — God Class, God Config & Refactoring-Prone
**Tanggal Audit**: 2026-05-15  
**Auditor**: Antigravity AI  
**Versi**: MajlisAI 3.1 Pro  
**Scope**: Frontend (src/), Backend (supabase/functions/), Scraper (scraper/)

---

## Ringkuman Eksekutif

Audit ini berfokus pada tiga pola arsitektur berbahaya yang sering muncul setelah pengembangan intensif:
1. **God Class** — satu kelas/komponen yang tahu dan melakukan terlalu banyak hal
2. **God Config** — konfigurasi yang membengkak dan mencampur banyak tanggung jawab
3. **Refactoring-Prone** — kode yang secara struktural rawan kerusakan saat diubah

| Kategori | Isu Ditemukan | Severity |
|----------|--------------|----------|
| God Class | 3 | 🔴🟡🟡 |
| God Config | 2 | 🔴🟡 |
| Refactoring-Prone | 5 | 🟡🟡🟡🟢🟢 |
| **Total** | **10** | |

---

## 🏛️ GOD CLASS

### GC-01 🔴 — `Admin.tsx` (248 baris, 5 tanggung jawab)
**File**: `src/pages/Admin.tsx`

Ini adalah God Class paling parah di proyek ini. Satu komponen menangani:

| # | Tanggung Jawab | Seharusnya Di |
|---|---------------|---------------|
| 1 | Fetch data events (pagination) | `useAdminEvents` hook |
| 2 | Fetch & manage targets | `useTargets` hook |
| 3 | Render tabel Events | `<EventsTable>` component |
| 4 | Render form & list Targets | `<TargetsManager>` component |
| 5 | Kalkulasi statistik | computed dari hooks |

**Gejala konkret:**
- 248 baris, salah satu file terbesar
- State variables: 9 buah (`targets`, `events`, `newTitle`, `loading`, `stats`, `activeTab`, `searchQuery`, `selectedIds`, `currentPage`)
- Fungsi CRUD langsung tertanam di dalam komponen UI (`addTarget`, `deleteTarget`, `deleteEvent`, `bulkDelete`)
- Jika ada perubahan skema DB, kita harus mengubah satu file besar ini

**Rekomendasi Refactor:**
```
src/
  pages/
    Admin.tsx              ← hanya render tab + stats
  features/
    admin/
      hooks/
        useAdminEvents.ts  ← semua state/logic events
        useTargets.ts      ← semua state/logic targets
      components/
        EventsTable.tsx
        TargetsManager.tsx
        StatsBanner.tsx
```

---

### GC-02 🟡 — `telegram-webhook/index.ts` (136 baris, 4 tanggung jawab)
**File**: `supabase/functions/telegram-webhook/index.ts`

Satu Edge Function menangani seluruh pipeline secara monolitik:

| # | Tanggung Jawab |
|---|---------------|
| 1 | Parsing request (octet-stream vs JSON, scraper vs Telegram official) |
| 2 | Upload gambar ke storage & generate hash |
| 3 | Panggil AI untuk ekstraksi data |
| 4 | Geocoding dengan Nominatim |
| 5 | Insert ke database |

**Gejala konkret:**
- Satu blok `try-catch` raksasa membungkus semua logika (Line 41-134)
- Jika ada perubahan skema tabel `events`, `getSmartCoordinates`, prompt AI, dan logika parsing semuanya terkena dampak di satu file
- Sangat sulit dites secara unit

**Rekomendasi:**
```typescript
// Pisahkan ke fungsi-fungsi terpisah:
async function parseRequest(req: Request): Promise<ParsedPayload>
async function uploadImageToStorage(buffer: ArrayBuffer): Promise<string>
async function analyzeWithAI(payload: ParsedPayload, imageUrl: string): Promise<ExtractedEvent>
async function saveEvent(extracted: ExtractedEvent, imageUrl: string): Promise<void>
```

---

### GC-03 🟡 — `useEvents.ts` (dua mode operasi dalam satu hook)
**File**: `src/hooks/useEvents.ts`

Hook ini memiliki dua *jalur eksekusi* yang sangat berbeda secara semantik:
- **Mode Radius**: Panggil Supabase RPC `search_events_v2` dengan koordinat user
- **Mode Global**: Query tabel `events` langsung tanpa filter lokasi

Keduanya dikontrol oleh kombinasi parameter `latitude`, `longitude`, dan `shouldWaitLocation` yang membuat kontrak API hook ini ambigu.

**Gejala konkret:**
```typescript
// Caller harus tahu "trik" ini agar map tidak loading selamanya:
useEvents(undefined, undefined, 100, false)  // MapView — tidak intuitif

// Caller lain harus tahu "trik" yang berbeda:
useEvents(lat, lon, 100, isLoading || isIdle) // Feed — logika di luar hook
```

**Rekomendasi:**
```typescript
// Pecah menjadi dua hook yang bersih:
useNearbyEvents(lat, lon, radiusKm)   // untuk Feed & Search
useAllEvents(limit)                    // untuk MapView & Admin
```

---

## ⚙️ GOD CONFIG

### GF-01 🔴 — Credential Hardcoded di `scraper/index.js`
**File**: `scraper/index.js` — Lines 8-9

```javascript
const apiId = 36686136;
const apiHash = "d99b7acca1c7e43e79382d9cab053d7d";
```

**Ini adalah security issue serius.** `apiId` dan `apiHash` Telegram ter-hardcode langsung di source code. Siapapun yang mengakses repository ini (misalnya saat push ke GitHub) akan mendapatkan akses penuh ke akun Telegram yang digunakan scraper.

`webhookUrl` di Line 11 juga hardcoded — padahal ini adalah URL yang berubah per environment (dev/staging/prod).

**Rekomendasi SEGERA:**
```javascript
// Pindahkan ke .env:
const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const webhookUrl = process.env.WEBHOOK_URL;
```
Dan pastikan `.env` ada di `.gitignore`!

---

### GF-02 🟡 — DEFAULT_IMAGE_URL Hardcoded di Edge Function
**File**: `supabase/functions/telegram-webhook/index.ts` — Line 12

```typescript
const DEFAULT_IMAGE_URL = 'https://dionpavjrstupazabtvf.supabase.co/storage/v1/object/public/...'
```

URL ini mengandung **Project ID Supabase** yang hardcoded. Jika project Supabase berubah (migrasi, staging, dll), URL ini harus diubah manual di dalam kode.

**Rekomendasi:**
```typescript
// Gunakan environment variable:
const DEFAULT_IMAGE_URL = Deno.env.get('DEFAULT_IMAGE_URL') || ''
// Dan daftarkan di Supabase Edge Function Secrets
```

---

## 🔧 REFACTORING-PRONE

### RP-01 🟡 — `EventDetail.tsx` menggunakan `useEvents()` secara tidak efisien
**File**: `src/pages/EventDetail.tsx` — Line 13

```typescript
const { events, loading } = useEvents(); // Memuat SEMUA data nasional hanya untuk .find() satu event
const event = events.find(e => e.id === id);
```

Halaman Detail **mengunduh seluruh dataset** (hingga 300 record) hanya untuk menemukan satu event berdasarkan ID. Ini sangat boros — baik dari sisi bandwidth maupun waktu tunggu.

Jika suatu saat database memiliki ribuan event, halaman detail akan semakin lambat.

**Rekomendasi:**
```typescript
// Buat hook khusus untuk fetch single event:
const { event, loading } = useEvent(id);
// Yang memanggil: supabase.from('events').select('*').eq('id', id).single()
```

---

### RP-02 🟡 — `EventCard.tsx` memiliki navigasi ganda yang saling bertumpuk
**File**: `src/components/EventCard.tsx` — Lines 13-22 & 80-87

```tsx
// Navigasi 1: onClick pada seluruh card
const handleDetail = () => { navigate(`/event/${event.id}`); };
<div onClick={handleDetail}>

  // Navigasi 2: onClick pada tombol "Detail" di dalam card
  <button onClick={() => onDetail?.(event)}>Detail</button>
</div>
```

Terdapat dua mekanisme navigasi yang tumpang tindih:
- Klik di mana saja pada card → navigasi via internal `handleDetail`
- Klik tombol "Detail" → memanggil prop `onDetail` dari parent

Ini berpotensi menyebabkan event handler bertabrakan dan perilaku yang tidak terprediksi. Prop `onDetail` sekarang sebenarnya sudah redundant karena navigasi sudah ditangani secara internal.

**Rekomendasi:** Hapus prop `onDetail` dari interface dan gunakan hanya internal `navigate`. Jika parent perlu custom behavior, gunakan prop `onClick` yang lebih generik.

---

### RP-03 🟡 — AI Prompt hardcoded sebagai string panjang di tengah fungsi
**File**: `supabase/functions/telegram-webhook/index.ts` — Lines 88-91

```typescript
const prompt = `Analisis pesan/poster ini. Apakah ini UNDANGAN KAJIAN ISLAM...
    HANYA tandai is_kajian: true...
    Jawab JSON: { is_kajian: boolean, title, speaker, date, time, location_name, city }.`
```

Prompt AI adalah *konfigurasi bisnis* yang paling sering berubah (fine-tuning, penambahan field output, perubahan bahasa). Saat ini ia tertanam di tengah logika request handling, sehingga setiap perubahan prompt berisiko menyentuh logika di sekitarnya.

**Rekomendasi:**
```typescript
// Pindahkan ke konstanta di bagian atas file atau file terpisah:
const KAJIAN_EXTRACTION_PROMPT = `...`

// Atau bahkan ke environment variable agar bisa diubah tanpa redeploy:
const prompt = Deno.env.get('AI_EXTRACTION_PROMPT') || KAJIAN_EXTRACTION_PROMPT
```

---

### RP-04 🟢 — `Layout.tsx` menggunakan `document.documentElement` untuk tema
**File**: `src/components/Layout.tsx` — Lines 43-46

```typescript
useEffect(() => {
  if (isDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}, [isDark]);
```

State tema disimpan secara lokal di `Layout.tsx` tetapi efeknya adalah global (DOM manipulation). Komponen lain yang membutuhkan info tema (misal `ThemeTileLayer` di Peta) tidak bisa mengaksesnya secara reaktif — mereka harus membaca DOM langsung. Ini adalah anti-pattern yang akan semakin menyakitkan seiring bertambahnya komponen.

**Rekomendasi:** Angkat state tema ke React Context (`ThemeContext`) atau gunakan library ringan seperti `zustand` dengan satu store `useThemeStore`.

---

### RP-05 🟢 — `ComingSoon.tsx` masih ada tapi sudah tidak digunakan
**File**: `src/pages/ComingSoon.tsx`

File ini masih ada di filesystem meskipun tidak lagi didaftarkan di router manapun setelah Search diimplementasikan. Ini adalah *dead file* yang bisa membingungkan developer yang baru masuk ke proyek.

**Rekomendasi:** Hapus file `src/pages/ComingSoon.tsx` jika tidak ada rencana menggunakannya lagi.

---

## Prioritas Tindakan

| Kode | Isu | Prioritas | Effort |
|------|-----|-----------|--------|
| GF-01 | Credential Telegram hardcoded di scraper | 🔴 Sekarang | Rendah (5 menit) |
| GC-01 | God Class `Admin.tsx` | 🟡 Iterasi Berikutnya | Tinggi |
| RP-01 | EventDetail fetch semua data hanya untuk 1 event | 🟡 Iterasi Berikutnya | Rendah |
| RP-02 | Double navigation di EventCard | 🟡 Iterasi Berikutnya | Rendah |
| GC-02 | God Function di Edge Function webhook | 🟡 Iterasi Berikutnya | Sedang |
| GF-02 | DEFAULT_IMAGE_URL hardcoded | 🟡 Iterasi Berikutnya | Rendah |
| RP-03 | AI Prompt hardcoded | 🟢 Nice-to-have | Rendah |
| GC-03 | useEvents dua mode dalam satu hook | 🟢 Nice-to-have | Sedang |
| RP-04 | Theme state tidak reaktif lintas komponen | 🟢 Nice-to-have | Sedang |
| RP-05 | Dead file `ComingSoon.tsx` | 🟢 Nice-to-have | Sangat Rendah |

---

## Catatan Positif (yang sudah baik)

- ✅ **`src/lib/formatters.ts`** — Pure functions yang rapi, terisolasi, mudah dites.
- ✅ **`src/lib/supabase.ts`** — Inisialisasi client yang bersih, dengan validasi env var.
- ✅ **`src/types/event.ts`** — Type definitions yang terpusat dan terdokumentasi dengan baik.
- ✅ **`src/components/Layout.tsx`** — Navigasi dipisahkan ke `NAV_ROUTES` array, mudah diperluas.
- ✅ **`src/hooks/useGeolocation.ts`** — Hook yang terfokus, single responsibility terpenuhi.
