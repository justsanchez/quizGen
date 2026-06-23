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

/**
 * Delete all Supabase data owned by `uid`, walking the FK chain from leaves
 * to root: quizzes + summaries → quiz_sets → folder → userFolder.
 *
 * Call this before deleting the Firebase account so the uid is still available.
 *
 * @param {string} uid - Firebase UID.
 * @returns {Promise<void>}
 */
export async function deleteUserData(uid) {
  const { data: userFolders, error: ufError } = await supabase
    .from('userFolder')
    .select('id')
    .eq('user_id', uid);

  if (ufError) throw ufError;
  if (!userFolders || userFolders.length === 0) return;

  const userFolderId = userFolders[0].id;

  const { data: folders, error: fError } = await supabase
    .from('folder')
    .select('id')
    .eq('userFolder', userFolderId);

  if (fError) throw fError;

  const folderIds = (folders || []).map((f) => f.id);

  if (folderIds.length > 0) {
    const { data: quizSets, error: qsError } = await supabase
      .from('quiz_sets')
      .select('id')
      .in('folder_id', folderIds);

    if (qsError) throw qsError;

    const quizSetIds = (quizSets || []).map((q) => q.id);

    if (quizSetIds.length > 0) {
      const [quizzesRes, summariesRes] = await Promise.all([
        supabase.from('quizzes').delete().in('quiz_set_id', quizSetIds),
        supabase.from('summaries').delete().in('quiz_set_id', quizSetIds),
      ]);
      if (quizzesRes.error) throw quizzesRes.error;
      if (summariesRes.error) throw summariesRes.error;

      const { error: deleteQsError } = await supabase
        .from('quiz_sets')
        .delete()
        .in('id', quizSetIds);
      if (deleteQsError) throw deleteQsError;
    }

    const { error: deleteFError } = await supabase
      .from('folder')
      .delete()
      .in('id', folderIds);
    if (deleteFError) throw deleteFError;
  }

  const { error: deleteUfError } = await supabase
    .from('userFolder')
    .delete()
    .eq('user_id', uid);
  if (deleteUfError) throw deleteUfError;
}
