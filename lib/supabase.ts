import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lglputauvbxhjxobtvqw.supabase.co';
const supabaseAnonKey = 'sb_publishable_X5-Md7fYzhO8vT29QEa5OQ_8OfkTAwd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
