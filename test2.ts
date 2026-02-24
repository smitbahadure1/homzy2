import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lglputauvbxhjxobtvqw.supabase.co';
const supabaseAnonKey = 'sb_publishable_X5-Md7fYzhO8vT29QEa5OQ_8OfkTAwd';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    console.log('profiles error?', error, 'data?', data);

    const { data: bData, error: bError } = await supabase.from('bookings').select('*').limit(1);
    console.log('bookings error?', bError, 'data?', bData);
}

checkTables();
