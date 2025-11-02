import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://dhfhmwokmtbxqsesjcbf.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZmhtd29rbXRieHFzZXNqY2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDM1ODQsImV4cCI6MjA3MjkxOTU4NH0.uvmNJjp42JTHqq9_065ip_Prt_hltV6S-JjdFE-fhD8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
