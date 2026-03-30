import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pljkezzhlbvccvjmoyxk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsamtlenpobGJ2Y2N2am1veXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjQ4ODIsImV4cCI6MjA4MTQwMDg4Mn0.USUnB2mX6VgxQHldOaOT2v_OLOQdCo2_xFqyzBtz5mQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
