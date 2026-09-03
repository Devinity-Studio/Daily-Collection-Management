/**
 * Supabase client configuration
 *
 * Usage:
 *   import { supabase } from "@/lib/supabase";
 *   const { data, error } = await supabase.from("table").select("*");
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY — Supabase client will not work."
  );
}

/**
 * Public client (uses anon key — respects RLS policies)
 */
export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? "",
  {
    auth: {
      persistSession: false,
    },
  }
);

/**
 * Admin client (uses service_role key — bypasses RLS, server-only!)
 * NEVER use in client-side code.
 */
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl ?? "", supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
