const SUPABASE_URL = 'https://zqjcxyqgctvlrhgaavjl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxamN4eXFnY3R2bHJoZ2FhdmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTU1ODIsImV4cCI6MjA4ODgzMTU4Mn0.MPDTgJElOOba39e3ir2mib8gIPHEFVd5rBUcSBgslY8';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);