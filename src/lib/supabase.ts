import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable session persistence to force fresh login every visit
    persistSession: false,
    // Set session storage to memory only (not localStorage)
    storage: undefined,
    // Auto refresh disabled since we want manual login each time
    autoRefreshToken: false,
    // Detect session in URL disabled
    detectSessionInUrl: false
  }
})

// Database table names for consistency
export const TABLES = {
  AUTHORS: 'authors',
  BOOKS: 'book',
  CATEGORIES: 'categories',
  SUPPLIERS: 'suppliers'
} as const
