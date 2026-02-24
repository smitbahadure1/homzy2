import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lglputauvbxhjxobtvqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnbHB1dGF1dmJ4aGp4b2J0dnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjQyMjEsImV4cCI6MjA4NjA0MDIyMX0.7J88tKea560XXI22fHA2BfEElZqWvcRgU_8vlf7mXJU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
