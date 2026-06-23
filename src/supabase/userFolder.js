import { supabase } from './client';

/**
 * Create a `userFolder` row for `uid` if one does not already exist.
 * Safe to call on every sign-in — it checks before inserting so returning
 * users don't get duplicate rows.
 *
 * @param {string} uid - Firebase UID (stored in the `user_id` column).
 * @returns {Promise<void>}
 */
export async function ensureUserFolder(uid) {
  const { data: existing, error: selectError } = await supabase
    .from('userFolder')
    .select('id')
    .eq('user_id', uid)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return;

  const { error: insertError } = await supabase
    .from('userFolder')
    .insert({ user_id: uid });

  if (insertError) throw insertError;
}
