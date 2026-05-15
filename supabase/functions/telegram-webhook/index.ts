import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { crypto } from "https://deno.land/std@0.211.0/crypto/mod.ts"

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const SUMOPOD_API_KEY = Deno.env.get('SUMOPOD_API_KEY')
const SUMOPOD_BASE_URL = Deno.env.get('SUMOPOD_BASE_URL') || 'https://ai.sumopod.com/v1'
const SUMOPOD_MODEL = Deno.env.get('SUMOPOD_MODEL') || 'gpt-4o-mini'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// URL Gambar Default MajlisAI (Pastikan file ini sudah ada di storage)
const DEFAULT_IMAGE_URL = 'https://dionpavjrstupazabtvf.supabase.co/storage/v1/object/public/event-images/branding/default_kajian.png'

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

async function getSmartCoordinates(address: string, city: string = "") {
  if (!address && !city) return null;
  const layers = [
    { q: `${address}, ${city}, Indonesia`, acc: 100 },
    { q: `${address}, Indonesia`, acc: 80 },
    { q: `${city}, Indonesia`, acc: 50 }
  ];
  for (const layer of layers) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(layer.q)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'MajlisAI-App' } });
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (lat > -11 && lat < 6 && lon > 95 && lon < 141) {
          return { lat, lon, accuracy: layer.acc };
        }
      }
    } catch (err) { continue; }
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const contentType = req.headers.get('content-type')
    let imgBuffer: ArrayBuffer | null = null
    let rawText: string | null = null
    let imageHash: string | null = null
    let finalImageUrl: string = DEFAULT_IMAGE_URL

    // MODE 1: Kiriman Gambar (application/octet-stream)
    if (contentType === 'application/octet-stream') {
      imgBuffer = await req.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest("SHA-256", imgBuffer)
      imageHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    } 
    // MODE 2: Kiriman Teks (application/json)
    else if (contentType === 'application/json') {
      const body = await req.json()
      // Jika dari Telegram Webhook resmi
      if (body.message || body.channel_post) {
        const msg = body.message || body.channel_post
        if (msg.photo) {
          const fileId = msg.photo[msg.photo.length - 1].file_id
          const fileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`)
          const fileInfo = await fileRes.json()
          const imgRes = await fetch(`https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileInfo.result.file_path}`)
          imgBuffer = await imgRes.arrayBuffer()
        } else {
          rawText = msg.text || msg.caption
        }
      } 
      // Jika dari Scraper (Custom Payload)
      else if (body.type === 'text') {
        rawText = body.content
      }
    }

    // CEK DUPLIKAT (Jika ada gambar)
    if (imageHash) {
      const { data: existing } = await supabase.from('events').select('id').eq('image_hash', imageHash).maybeSingle()
      if (existing) return new Response('Duplicate Image', { status: 200 })
      
      const storagePath = `posters/${imageHash}.jpg`
      await supabase.storage.from('event-images').upload(storagePath, imgBuffer!, { contentType: 'image/jpeg', upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(storagePath)
      finalImageUrl = publicUrl
    }

    // ANALISIS AI (Gambar atau Teks)
    const prompt = `Analisis pesan/poster ini. Apakah ini UNDANGAN KAJIAN ISLAM (ada waktu, tempat, pemateri)? 
    HANYA tandai is_kajian: true jika ini adalah info acara kajian. 
    Jika ini hanya kutipan nasihat, hadits, atau berita tanpa jadwal acara, tandai is_kajian: false.
    Jawab JSON: { is_kajian: boolean, title, speaker, date, time, location_name, city }.`

    const messages = [{ role: 'user', content: [{ type: 'text', text: prompt }] }]
    if (imgBuffer) {
      messages[0].content.push({ type: 'image_url', image_url: { url: finalImageUrl } })
    } else if (rawText) {
      messages[0].content.push({ type: 'text', text: `Teks Broadcast: ${rawText}` })
    } else {
      return new Response('No data', { status: 200 })
    }

    const aiRes = await fetch(`${SUMOPOD_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUMOPOD_API_KEY}` },
      body: JSON.stringify({ model: SUMOPOD_MODEL, messages, response_format: { type: 'json_object' } })
    })

    const aiResult = await aiRes.json()
    const extracted = JSON.parse(aiResult.choices[0].message.content)

    // FILTER KETAT
    if (!extracted.is_kajian) return new Response('Filtered (Not a Kajian)', { status: 200 })

    const geo = await getSmartCoordinates(extracted.location_name, extracted.city);
    if (!geo) return new Response('Geo not found', { status: 200 })

    await supabase.from('events').insert({
      title: extracted.title || 'Kajian Islam',
      speaker: extracted.speaker || 'Ustadz',
      starts_at: `${extracted.date || '2026-05-15'}T${extracted.time || '16:00'}:00`,
      location_name: extracted.location_name || extracted.city,
      coordinates: `POINT(${geo.lon} ${geo.lat})`,
      latitude: geo.lat,
      longitude: geo.lon,
      location_accuracy: geo.accuracy,
      image_url: finalImageUrl,
      image_hash: imageHash || `text-${Date.now()}`,
      status: 'active'
    })

    return new Response('Success', { status: 200 })
  } catch (err) {
    return new Response('Error: ' + err.message, { status: 200 })
  }
})
