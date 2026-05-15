import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { crypto } from "https://deno.land/std@0.211.0/crypto/mod.ts"

const SUMOPOD_API_KEY = Deno.env.get('SUMOPOD_API_KEY')
const SUMOPOD_BASE_URL = Deno.env.get('SUMOPOD_BASE_URL') || 'https://ai.sumopod.com/v1'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

Deno.serve(async (req) => {
  // Handle CORS for browser testing if needed
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const body = await req.text()
    console.log('[Raw Body]', body)
    
    if (!body) return new Response('Empty body', { status: 400 })
    
    const payload = JSON.parse(body)
    console.log('[All Keys]', Object.keys(payload).join(', '))
    
    const sender = payload.sender || payload.pengirim
    const message = payload.message || payload.pesan
    const url = payload.url || payload.file || payload.image || payload.link || payload.attachment
    const filename = payload.filename || payload.file_name

    console.info(`[Webhook] From: ${sender}, Msg: ${message}, URL: ${url ? 'Ada' : 'Kosong'}`)

    if (!url || !url.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return new Response(JSON.stringify({ message: 'Bukan gambar atau URL tidak ditemukan.' }), { status: 200 })
    }

    // Download Gambar
    const imgRes = await fetch(url)
    if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.statusText}`)
    
    const imgBlob = await imgRes.blob()
    const imgBuffer = await imgBlob.arrayBuffer()
    
    // Hash untuk deduplikasi
    const hashBuffer = await crypto.subtle.digest("SHA-256", imgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const imageHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Cek Duplikat
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('image_hash', imageHash)
      .maybeSingle()

    if (existing) {
      return new Response(JSON.stringify({ message: 'Poster sudah ada.', id: existing.id }), { status: 200 })
    }

    // Upload Storage
    const filePath = `posters/${imageHash}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, imgBuffer, { contentType: 'image/jpeg', upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(filePath)

    // AI Extraction
    const prompt = `Analisis poster kajian ini: ${publicUrl}. Ekstrak JSON: {title, speaker, date(YYYY-MM-DD), time(HH:mm), location_name, latitude, longitude, classification_score(0-1)}`

    const aiRes = await fetch(`${SUMOPOD_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUMOPOD_API_KEY}` },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    })

    const aiResult = await aiRes.json()
    const extracted = JSON.parse(aiResult.choices[0].message.content)

    // Simpan ke DB
    const { error: dbError } = await supabase
      .from('events')
      .insert({
        title: extracted.title,
        speaker: extracted.speaker,
        starts_at: `${extracted.date}T${extracted.time}:00`,
        location_name: extracted.location_name,
        coordinates: `POINT(${extracted.longitude} ${extracted.latitude})`,
        latitude: extracted.latitude,
        longitude: extracted.longitude,
        image_url: publicUrl,
        image_hash: imageHash,
        source_platform: 'WhatsApp',
        status: extracted.classification_score >= 0.7 ? 'active' : 'review'
      })

    if (dbError) throw dbError

    return new Response(JSON.stringify({ success: true, title: extracted.title }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error(`[Fatal Error]`, err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
