import { supabase } from '@/integrations/supabase/client'

export async function fetchTrustEvents() {
  const { data, error } = await supabase
    .from('trust_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error
  return data
}
