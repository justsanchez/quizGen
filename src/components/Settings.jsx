import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase/client";

/**
 * `/settings` page for editing the per-user prompt overrides stored in the
 * `userFolder` table (`quizPrompt`, `summaryPrompt`). Detects whether the
 * row uses camelCase or snake_case columns and writes back accordingly, so
 * either DB schema works without code changes.
 *
 * Falls back to a not-logged-in / no-row state when applicable.
 *
 * @component
 * @returns {JSX.Element}
 */
const Settings = () => {
  const { userLoggedIn, currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [userFolderRow, setUserFolderRow] = useState(null);
  const [quizPrompt, setQuizPrompt] = useState("");
  const [summaryPrompt, setSummaryPrompt] = useState("");

  const [quizPromptColumn, setQuizPromptColumn] = useState("quizPrompt");
  const [summaryPromptColumn, setSummaryPromptColumn] = useState("summaryPrompt");

  const canEdit = useMemo(() => {
    return Boolean(userLoggedIn && currentUser?.uid && userFolderRow?.id);
  }, [userLoggedIn, currentUser?.uid, userFolderRow?.id]);

  useEffect(() => {
    const fetchUserFolder = async () => {
      if (!userLoggedIn || !currentUser?.uid) {
        setUserFolderRow(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data: rows, error } = await supabase
          .from("userFolder")
          .select("*")
          .eq("user_id", currentUser.uid)
          .limit(1);

        if (error) throw error;

        const row = rows?.[0] ?? null;
        setUserFolderRow(row);

        if (!row) return;

        // Support either camelCase or snake_case, depending on the DB schema.
        const qpCol = Object.prototype.hasOwnProperty.call(row, "quizPrompt")
          ? "quizPrompt"
          : Object.prototype.hasOwnProperty.call(row, "quiz_prompt")
            ? "quiz_prompt"
            : "quizPrompt";
        const spCol = Object.prototype.hasOwnProperty.call(row, "summaryPrompt")
          ? "summaryPrompt"
          : Object.prototype.hasOwnProperty.call(row, "summary_prompt")
            ? "summary_prompt"
            : "summaryPrompt";

        setQuizPromptColumn(qpCol);
        setSummaryPromptColumn(spCol);

        setQuizPrompt((row?.[qpCol] ?? "").toString());
        setSummaryPrompt((row?.[spCol] ?? "").toString());
      } catch (e) {
        console.error("Error fetching userFolder:", e);
        toast.error("Failed to load your settings from Supabase.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFolder();
  }, [userLoggedIn, currentUser?.uid]);

  const handleSave = async () => {
    if (!canEdit) {
      toast.error("You must be logged in to save settings.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        [quizPromptColumn]: quizPrompt,
        [summaryPromptColumn]: summaryPrompt,
      };

      const { error } = await supabase
        .from("userFolder")
        .update(payload)
        .eq("id", userFolderRow.id);

      if (error) throw error;
      toast.success("Settings saved.");
    } catch (e) {
      console.error("Error saving settings:", e);
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="content-container text-gray-200">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-sm text-gray-400 mb-6">
        Edit the prompts stored in your account.
      </p>

      {!userLoggedIn && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-300">Please log in to view and edit your prompt settings.</p>
        </div>
      )}

      {userLoggedIn && isLoading && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-300">Loading your settings…</p>
        </div>
      )}

      {userLoggedIn && !isLoading && !userFolderRow && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-300 mb-2">
            No <code>userFolder</code> row found for your account.
          </p>
        </div>
      )}

      {userLoggedIn && !isLoading && userFolderRow && (
        <div className="space-y-4">
          <label className="block text-sm font-medium mb-2">
            Quiz Prompt
          </label>
            <textarea
              value={quizPrompt}
              onChange={(e) => setQuizPrompt(e.target.value)}
              rows={13}
              placeholder="Enter the prompt used to generate quizzes…"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white resize-y focus:outline-none"
            />

          <label className="block text-sm font-medium mb-2">
            Summary Prompt
          </label>
            <textarea
              value={summaryPrompt}
              onChange={(e) => setSummaryPrompt(e.target.value)}
              rows={15}
              placeholder="Enter the prompt used to generate summaries…"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white resize-y focus:outline-none"
            />

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !canEdit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed rounded text-white font-medium"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>

            <button
              onClick={() => {
                if (!userFolderRow) return;
                setQuizPrompt((userFolderRow?.[quizPromptColumn] ?? "").toString());
                setSummaryPrompt((userFolderRow?.[summaryPromptColumn] ?? "").toString());
              }}
              disabled={isSaving || !userFolderRow}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded text-white"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;