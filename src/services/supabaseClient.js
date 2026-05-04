import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://sjnpnexdwwxzeatogcxv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbnBuZXhkd3d4emVhdG9nY3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNTc3MDQsImV4cCI6MjA5MDkzMzcwNH0.YRzpvrRj7ztwr8H6LOyon_5Df3B8JzcXrtJnU87ELW8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
