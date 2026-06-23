import React, { useEffect, useMemo, useRef, useState } from "react";
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
 * Both fields are OPTIONAL overrides — leaving one blank makes the generator
 * fall back to quizGen's built-in default (see `services/deepSeek.js`). The two
 * behave differently downstream, which the UI now calls out:
 *   - Quiz Prompt    → appended as EXTRA instructions to the quiz generator.
 *   - Summary Prompt → REPLACES the default notes prompt (transcript appended).
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

  // Last-saved baselines, used to detect unsaved changes and to revert.
  const [savedQuizPrompt, setSavedQuizPrompt] = useState("");
  const [savedSummaryPrompt, setSavedSummaryPrompt] = useState("");

  const [quizPromptColumn, setQuizPromptColumn] = useState("quizPrompt");
  const [summaryPromptColumn, setSummaryPromptColumn] = useState("summaryPrompt");

  const canEdit = useMemo(() => {
    return Boolean(userLoggedIn && currentUser?.uid && userFolderRow?.id);
  }, [userLoggedIn, currentUser?.uid, userFolderRow?.id]);

  const isDirty = quizPrompt !== savedQuizPrompt || summaryPrompt !== savedSummaryPrompt;

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

        const qp = (row?.[qpCol] ?? "").toString();
        const sp = (row?.[spCol] ?? "").toString();
        setQuizPrompt(qp);
        setSummaryPrompt(sp);
        setSavedQuizPrompt(qp);
        setSavedSummaryPrompt(sp);
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
    if (!isDirty || isSaving) return;

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

      // Move the baseline forward so the form is no longer "dirty".
      setSavedQuizPrompt(quizPrompt);
      setSavedSummaryPrompt(summaryPrompt);
      toast.success("Settings saved.");
    } catch (e) {
      console.error("Error saving settings:", e);
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = () => {
    setQuizPrompt(savedQuizPrompt);
    setSummaryPrompt(savedSummaryPrompt);
  };

  // Cmd/Ctrl+S saves. A ref keeps the latest handler without re-binding the listener.
  const saveRef = useRef(handleSave);
  saveRef.current = handleSave;
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="content-container text-gray-200">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-sm text-gray-400 mb-6">
        Customize how quizGen generates your quizzes and study notes. These are optional —
        leave a field blank to use the built-in default.
      </p>

      {!userLoggedIn && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-300">Please log in to view and edit your prompt settings.</p>
        </div>
      )}

      {userLoggedIn && isLoading && (
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-700 rounded-lg"></div>
          <div className="h-40 bg-gray-700 rounded-lg"></div>
        </div>
      )}

      {userLoggedIn && !isLoading && !userFolderRow && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-300 mb-1">We couldn't find a settings record for your account yet.</p>
          <p className="text-sm text-gray-400">
            Generate and save your first study set to set up your account, then come back here to customize your prompts.
          </p>
        </div>
      )}

      {userLoggedIn && !isLoading && userFolderRow && (
        <div className="space-y-4 pb-24">
          <PromptCard
            title="Quiz Prompt"
            description="Added as extra instructions to the quiz generator, on top of quizGen's built-in rules. Great for steering tone, focus areas, or question style. Leave blank to use the default only."
            value={quizPrompt}
            placeholder="e.g. Prioritize practical, exam-style questions and include a real-world example in each explanation."
            onChange={setQuizPrompt}
            onResetToDefault={() => setQuizPrompt("")}
            rows={10}
          />

          <PromptCard
            title="Summary Prompt"
            description="Replaces the default study-notes prompt entirely. Your transcript is appended automatically, so write this as a full instruction to the notes generator. Leave blank to use the default."
            value={summaryPrompt}
            placeholder="e.g. You are an expert tutor. Produce concise, well-structured markdown notes with headings, bullet points, and a comparison table where useful."
            onChange={setSummaryPrompt}
            onResetToDefault={() => setSummaryPrompt("")}
            rows={12}
          />

          {/* Sticky action bar */}
          <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-gray-900/95 backdrop-blur border-t border-gray-700 px-4 md:px-6 py-3 flex items-center gap-3 z-30">
            <button
              onClick={handleSave}
              disabled={isSaving || !canEdit || !isDirty}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed rounded text-white font-medium"
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>

            <button
              onClick={handleRevert}
              disabled={isSaving || !isDirty}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 rounded text-white"
            >
              Revert changes
            </button>

            <span className="text-sm ml-auto">
              {isDirty ? (
                <span className="text-yellow-400">● Unsaved changes</span>
              ) : (
                <span className="text-gray-500">All changes saved</span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * A single labeled prompt editor: title, description, textarea, a char counter,
 * a custom/default status badge, and a "Reset to default" (clear) action.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} props.value
 * @param {string} props.placeholder
 * @param {(next: string) => void} props.onChange
 * @param {() => void} props.onResetToDefault - Clears the field (blank ⇒ app default).
 * @param {number} props.rows
 */
const PromptCard = ({ title, description, value, placeholder, onChange, onResetToDefault, rows }) => {
  const isCustom = value.trim().length > 0;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isCustom ? "bg-blue-600 text-gray-100" : "bg-gray-700 text-gray-300"
          }`}
        >
          {isCustom ? "Custom" : "Using default"}
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-3">{description}</p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">{value.length.toLocaleString()} characters</span>
        <button
          onClick={onResetToDefault}
          disabled={!isCustom}
          className="text-xs text-blue-400 hover:text-blue-300 underline disabled:text-gray-600 disabled:no-underline disabled:cursor-not-allowed"
          title="Clear this field so the built-in default prompt is used"
        >
          Reset to default
        </button>
      </div>
    </div>
  );
};

export default Settings;
