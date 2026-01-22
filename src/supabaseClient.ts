
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    // It's okay to not have them during build or initial setup, but app needs them to run.
    console.warn('Missing Supabase Environment Variables!')
}

export const supabase = createClient<Database, 'pos'>(supabaseUrl || '', supabaseAnonKey || '', {
    db: {
        schema: 'pos'
    }
})
