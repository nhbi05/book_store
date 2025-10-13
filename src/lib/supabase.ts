import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable session persistence - sessions survive browser refresh
    persistSession: true,
    // Store session in localStorage (survives browser close)
    storage: window.localStorage,
    // Automatically refresh tokens to keep user logged in
    autoRefreshToken: true,
    // Detect session in URL (for email confirmations)
    detectSessionInUrl: true
  }
})

// Database table names for consistency
export const TABLES = {
  AUTHORS: 'authors',
  BOOKS: 'book',
  CATEGORIES: 'categories',
  SUPPLIERS: 'suppliers',
  PURCHASES: 'purchases',
  PURCHASE_DETAILS: 'purchasedetails',
  CUSTOMERS: 'customers', 
  ORDERS: 'orders', 
  ORDER_DETAILS: 'orderdetails',
} as const
