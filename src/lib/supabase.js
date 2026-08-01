import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''

// Guard: if env vars aren't set, create a no-op client stub so the app doesn't crash
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : { from: () => ({ select: async () => ({ data: [], error: null }), upsert: async () => ({ error: null }), insert: async () => ({ data: null, error: null }), update: async () => ({ error: null }) }) }
