import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_A_URL || 'https://nuebsjpaofxixoxpgadp.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_A_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZWJzanBhb2Z4aXhveHBnYWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzM2MTEsImV4cCI6MjA4ODQwOTYxMX0.cB-ZZfsOZyeaT6a6uSGp13EFhvT2-OShOKDEVY-JlHg'

export const supabaseA = createClient(SUPABASE_URL, SUPABASE_KEY)
