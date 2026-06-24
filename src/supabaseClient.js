import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ekkmkmprutrbtelifjns.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7DTi3sEjQdVK1C_OLnosmQ_jd5ItnQJ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
