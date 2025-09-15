import { createClient } from '@supabase/supabase-js';

// Client amministrativo SOLO lato server (service role bypassa RLS)
// Non esporre mai questa chiave nel client/browser.
export const supaAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
