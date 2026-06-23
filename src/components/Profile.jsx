import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaGoogle, FaEnvelope, FaKey, FaSignOutAlt, FaCog, FaFolder, FaLayerGroup, FaTags, FaRegQuestionCircle } from "react-icons/fa";
import { toast } from "react-toastify";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase/client";
import { logout, resetPassword, deleteCurrentUser } from "../firebase/auth";
import { deleteUserData } from "../supabase/userFolder";
import { normalizeTags } from "../helper/quizHelper";

// `content-container` lives in this stylesheet; import it so the class is bundled
// even on a cold direct load of /profile (no quiz screen mounted yet).
import "../styles/QuizSection.css";

/**
 * Format an ISO/RFC date string as a short local date, or "—" when absent.
 * @param {string|undefined|null} value
 * @returns {string}
 */
function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/**
 * `/profile` page — a learner dashboard (identity + study stats + recent activity)
 * with a light account/security section. Reuses the same `userFolder → folder →
 * quiz_sets` query chain as `Library.jsx` to derive aggregate study stats.
 *
 * `Layout` is the auth guard, so logged-out visitors are redirected to `/` before
 * this renders; the not-logged-in branch here is just a fallback.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function Profile() {
  const { userLoggedIn, currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState([]);
  const [quizSets, setQuizSets] = useState([]);
  const [questionsPracticed, setQuestionsPracticed] = useState(null); // null → "—" (best-effort)
  const [sendingReset, setSendingReset] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userLoggedIn || !currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        // 1. The user's root folder record
        const { data: userFolders, error: userFolderError } = await supabase
          .from("userFolder")
          .select("*")
          .eq("user_id", currentUser.uid);

        if (userFolderError) throw userFolderError;
        if (!userFolders || userFolders.length === 0) {
          // No userFolder row yet → nothing saved. Render empty dashboard, not an error.
          setFolders([]);
          setQuizSets([]);
          return;
        }

        const userFolderId = userFolders[0].id;

        // 2. Folders under this user
        const { data: folderRows, error: foldersError } = await supabase
          .from("folder")
          .select("*")
          .eq("userFolder", userFolderId);

        if (foldersError) throw foldersError;
        setFolders(folderRows || []);

        const folderIds = (folderRows || []).map((f) => f.id);
        if (folderIds.length === 0) {
          setQuizSets([]);
          return;
        }

        // 3. Quiz sets across all folders (newest first)
        const { data: setRows, error: setsError } = await supabase
          .from("quiz_sets")
          .select("*")
          .in("folder_id", folderIds)
          .order("created_at", { ascending: false });

        if (setsError) throw setsError;
        setQuizSets(setRows || []);

        // 4. Best-effort "questions practiced". This pulls every quiz's JSON, so it
        // can be a heavy payload for large libraries — isolated so a failure just
        // degrades the one stat to "—". Long-term: a count column or RPC.
        const setIds = (setRows || []).map((s) => s.id);
        if (setIds.length > 0) {
          try {
            const { data: quizRows, error: quizError } = await supabase
              .from("quizzes")
              .select("quiz_data")
              .in("quiz_set_id", setIds);

            if (!quizError && quizRows) {
              const total = quizRows.reduce((sum, row) => {
                const qd = row.quiz_data;
                const questions = Array.isArray(qd) ? qd : qd?.quiz ?? [];
                return sum + (Array.isArray(questions) ? questions.length : 0);
              }, 0);
              setQuestionsPracticed(total);
            }
          } catch (qErr) {
            console.error("Questions-practiced count failed (non-fatal):", qErr);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userLoggedIn, currentUser]);

  // ---- Derived stats ----
  const allTags = useMemo(
    () => [...new Set(quizSets.flatMap((q) => normalizeTags(q.tags)))],
    [quizSets]
  );
  const recentSets = useMemo(() => quizSets.slice(0, 5), [quizSets]);

  const provider = currentUser?.providerData?.[0]?.providerId; // 'google.com' | 'password'
  const isPasswordUser = provider === "password";

  // ---- Account actions ----
  const handleResetPassword = async () => {
    if (!currentUser?.email) return;
    setSendingReset(true);
    try {
      await resetPassword(currentUser.email);
      toast.success(`Password reset email sent to ${currentUser.email}`);
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Couldn't send the reset email. Please try again.");
    } finally {
      setSendingReset(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout(); // Layout's auth guard redirects to "/"
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out.");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteUserData(currentUser.uid);
      await deleteCurrentUser();
      // Auth state change triggers Layout's guard — no explicit navigate needed.
    } catch (error) {
      console.error("Account deletion error:", error);
      if (error.code === "auth/requires-recent-login") {
        toast.error("For security, please sign out and sign back in before deleting your account.");
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!userLoggedIn) {
    return (
      <div className="content-container text-gray-200">
        <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-300">
            Please <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">log in</Link> to view your profile.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="content-container text-gray-200">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-500 rounded mb-6"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-600"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 bg-gray-600 rounded"></div>
              <div className="h-4 w-56 bg-gray-700 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayName = currentUser?.displayName || "Learner";
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

  const stats = [
    { label: "Study Sets", value: quizSets.length, icon: <FaLayerGroup /> },
    { label: "Folders", value: folders.length, icon: <FaFolder /> },
    { label: "Topics", value: allTags.length, icon: <FaTags /> },
    { label: "Questions Practiced", value: questionsPracticed ?? "—", icon: <FaRegQuestionCircle /> },
  ];

  return (
    <div className="content-container text-gray-200">
      <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
      <p className="text-sm text-gray-400 mb-6">Your study journey at a glance.</p>

      {/* Identity hero */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <img
            src={currentUser?.photoURL || avatarFallback}
            alt={displayName}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = avatarFallback;
            }}
            className="w-20 h-20 rounded-full border border-gray-600 object-cover"
          />
          <div className="min-w-0">
            <h2 className="text-xl font-semibold truncate">{displayName}</h2>
            <p className="text-sm text-gray-400 truncate">{currentUser?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded-full">
                {provider === "google.com" ? <FaGoogle /> : <FaEnvelope />}
                {provider === "google.com" ? "Google" : "Email & Password"}
              </span>
              <span className="text-xs text-gray-400">
                Member since {formatDate(currentUser?.metadata?.creationTime)}
              </span>
              <span className="text-xs text-gray-500">
                · Last active {formatDate(currentUser?.metadata?.lastSignInTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <span className="text-blue-400">{stat.icon}</span>
              {stat.label}
            </div>
            <span className="text-3xl font-bold text-gray-100">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Top topics */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-3">Top Topics</h3>
        {allTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 12).map((tag, index) => (
              <span key={index} className="text-xs bg-blue-600 px-2 py-1 rounded-full text-gray-100">
                {tag}
              </span>
            ))}
            {allTags.length > 12 && (
              <span className="text-xs text-gray-400">+{allTags.length - 12} more</span>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No topics yet — tag your study sets to see them here.</p>
        )}
      </div>

      {/* Recent study sets */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Recent Study Sets</h3>
          <Link to="/library" className="text-sm text-blue-400 hover:text-blue-300 underline">
            View all
          </Link>
        </div>

        {recentSets.length > 0 ? (
          <div className="grid gap-2">
            {recentSets.map((set) => {
              const tags = normalizeTags(set.tags);
              return (
                <Link
                  key={set.id}
                  to={`/quiz/${set.id}`}
                  className="block p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{set.title}</h4>
                    <span className="text-sm text-gray-400 whitespace-nowrap ml-3">
                      {formatDate(set.created_at)}
                    </span>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-blue-600 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📚</div>
            <p className="text-gray-400 mb-4">No study sets yet. Generate your first quiz to get started!</p>
            <Link
              to="/prompt"
              className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-medium"
            >
              Generate a quiz
            </Link>
          </div>
        )}
      </div>

      {/* Account & security */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Account &amp; Security</h3>
        <div className="flex flex-wrap gap-3">
          {isPasswordUser && (
            <button
              onClick={handleResetPassword}
              disabled={sendingReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed rounded text-white font-medium"
            >
              <FaKey /> {sendingReset ? "Sending…" : "Send password reset email"}
            </button>
          )}
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            <FaCog /> Customize AI prompts
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-red-600 rounded text-white transition-colors"
          >
            <FaSignOutAlt /> Sign out
          </button>
        </div>
        {provider === "google.com" && (
          <p className="text-xs text-gray-500 mt-3">
            You're signed in with Google — manage your password through your Google account.
          </p>
        )}

        {/* Danger zone */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h4>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors text-sm"
            >
              Delete account
            </button>
          ) : (
            <div className="bg-red-950/40 border border-red-700 rounded-lg p-4">
              <p className="text-sm text-red-300 font-medium mb-1">This cannot be undone.</p>
              <p className="text-xs text-gray-400 mb-4">
                All your folders, study sets, quizzes, and summaries will be permanently deleted, and your account will be removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-sm font-medium"
                >
                  {deleting ? "Deleting…" : "Yes, delete everything"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
