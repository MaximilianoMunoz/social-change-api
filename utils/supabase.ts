import { createClient } from '@supabase/supabase-js'

let supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zhvbwnkyryibfifzhqin.supabase.co"
let supabase_key = process.env.NEXT_PUBLIC_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpodmJ3bmt5cnlpYmZpZnpocWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkwNTA5MTIsImV4cCI6MjAxNDYyNjkxMn0.VCZUQZUB993mlGtMDtB2TMIg-XrmOXNPk1Zpuj-6QhI"

const getSupabase = (access_token: string) => {
    const supabase = createClient(
        supabase_url,
        supabase_key
    )

    supabase.auth.session = () => ({
        access_token,
        token_type: "",
        user: null
    })

    return supabase
}

export { getSupabase }