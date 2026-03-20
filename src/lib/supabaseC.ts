import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_C_URL || 'https://akvwqlplfkvhyvzvrjlf.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_C_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdndxbHBsZmt2aHl2enZyamxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzgxMzIsImV4cCI6MjA4OTYxNDEzMn0.DSO3oGxQh1O8-n9_TSZkcMPdw_tacvs75zWawCuFcok'

export const supabaseC = createClient(SUPABASE_URL, SUPABASE_KEY)
