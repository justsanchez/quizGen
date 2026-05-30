/**
 * Singleton Supabase client used app-wide for reads/writes against the
 * `userFolder`, `folder`, `quiz_sets`, `quizzes`, and `summaries` tables.
 *
 * Required env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);