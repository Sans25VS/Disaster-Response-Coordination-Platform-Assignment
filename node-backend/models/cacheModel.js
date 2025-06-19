import { supabase } from '../utils/supabaseClient.js';

export async function getCache(key) {
  const { data } = await supabase
    .from('cache')
    .select('value, expires_at')
    .eq('key', key)
    .single();
  if (data && new Date(data.expires_at) > new Date()) return data.value;
  return null;
}

export async function setCache(key, value, ttlMs = 3600000) {
  await supabase.from('cache').upsert({
    key,
    value,
    expires_at: new Date(Date.now() + ttlMs).toISOString()
  });
} 