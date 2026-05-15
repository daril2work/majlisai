// Central domain types for MajlisAI
// Synchronized with Supabase `events` table schema

export type EventStatus = 'active' | 'review' | 'expired';

export type EventSource = 'WhatsApp' | 'Telegram' | 'Manual';

export interface Event {
  id: string;
  title: string;
  speaker: string;
  starts_at: string;        // ISO timestamp — matches DB column `starts_at`
  location_name: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  image_hash?: string;
  source_platform: EventSource;
  status: EventStatus;
  distance?: number;        // meters — injected by proximity RPC, not in DB
}

// For form/upload use cases where partial data is acceptable
export type EventDraft = Omit<Event, 'id' | 'status' | 'distance'> & {
  status?: EventStatus;
};
