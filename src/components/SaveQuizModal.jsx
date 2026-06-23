import React, { useState } from "react";
import { supabase } from "../supabase/client";
import { useAuth } from "../contexts/AuthContext";
import { toast } from 'react-toastify';


/**
 * Modal for persisting a generated quiz + summary into the user's library.
 * The user picks an existing folder (or creates a new one), confirms a title,
 * and on save the modal inserts rows into `folder` (if new), `quiz_sets`,
 * `quizzes`, and `summaries` (the latter two in parallel).
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibility of the modal.
 * @param {() => void} props.onClose - Called to dismiss without saving.
 * @param {string} props.quizSummaryId - UUID linking quiz + summary to a single set.
 * @param {string} props.quizSummaryTitle - Default title prefilled into the form.
 * @param {string[]|string} [props.initialTags] - Tags to prefill (array or comma-separated string).
 * @param {object} props.quizData - JSON quiz to persist into the `quizzes` table.
 * @param {string} props.summaryData - Markdown summary to persist into `summaries`.
 * @param {(quizSetId: string, tags: string) => void} [props.onSaveComplete] - Called with the new `quiz_sets.id` and the saved comma-separated tags after a successful save.
 * @returns {JSX.Element|null}
 */
/** Coerce an `initialTags` prop (array or comma-separated string) into an array. */
const toTagArray = (value) => {
  if (Array.isArray(value)) return value.map((t) => String(t).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((t) => t.trim()).filter(Boolean);
  return [];
};

const SaveQuizModal = ({ isOpen, onClose, quizSummaryId, quizSummaryTitle, initialTags, quizData, summaryData, onSaveComplete }) => {
  const { userLoggedIn, currentUser } = useAuth();
  const [userFolder, setUserFolder] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [quizSetTitle, setQuizSetTitle] = useState(quizSummaryTitle);
  const [tags, setTags] = useState(() => toTagArray(initialTags));
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createNewFolder, setCreateNewFolder] = useState(false);

  // Fetch user's folders when modal opens, and sync title/tags from the latest
  // props (state initializers only run once, so this keeps a reopened modal fresh).
  React.useEffect(() => {
    if (isOpen) {
      fetchFolders();
      setQuizSetTitle(quizSummaryTitle);
      setTags(toTagArray(initialTags));
    }
  }, [isOpen]);

  const fetchFolders = async () => {
    try {

      console.log('Fetching quizData:', quizData);

      // First get the user folder
      const { data: userFolder, error: userFolderError } = await supabase
      .from('userFolder')
      .select('*')
      .eq('user_id', currentUser.uid);

      if (userFolderError) throw userFolderError;
      setUserFolder(userFolder || []);
      if (!userFolder || userFolder.length === 0) {
      console.log('No user folder found');
      return;
      }

      console.log('User folder:', JSON.stringify(userFolder, null, 2));


      console.log('Fetching folders for user:', userFolder[0].id);
      const { data, error } = await supabase
        .from('folder')
        .select('*')
        .eq('userFolder', userFolder[0].id)

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleSaveQuiz = async () => {
    
    if (!selectedFolderId && !createNewFolder) {
      toast.error("Please select a folder or create a new folder");
      return;
    }
    
    if (createNewFolder && !newFolderName.trim()) {
      toast.error("To create a new folder, please enter a folder name");
      return;
    }

    if (!quizSetTitle.trim()) {
      toast.error("Please enter a title for your quiz set");
      return;
    }

    setIsLoading(true);

    try {
      let folderId = selectedFolderId;

      // Create new folder if needed
      if (createNewFolder) {
        const { data: folderData, error: folderError } = await supabase
          .from('folder')
          .insert({
            title: newFolderName.trim(),
            userFolder: userFolder[0].id
          })
          .select()
          .single();

        if (folderError) throw folderError;
        folderId = folderData.id;
      }

      // Create quiz set
      const { data: quizSetData, error: quizSetError } = await supabase
        .from('quiz_sets')
        .insert({
          folder_id: folderId,
          quiz_summary_id: quizSummaryId,
          title: quizSetTitle.trim(),
          // Stored as a comma-separated string to match the `tags` text column.
          tags: tags.join(', '),
        })
        .select()
        .single();

      if (quizSetError) throw quizSetError;

      // Save quiz and summary in parallel
      const [quizRes, summaryRes] = await Promise.all([
        supabase.from('quizzes').insert({
          quiz_set_id: quizSetData.id,
          quiz_data: quizData,
          is_reinforced: false
        }),
        supabase.from('summaries').insert({
          quiz_set_id: quizSetData.id,
          title: quizSetTitle.trim(),
          summary_content: summaryData
        })
      ]);

      if (quizRes.error) throw quizRes.error;
      if (summaryRes.error) throw summaryRes.error;

      // alert("Quiz set saved successfully!");
      onSaveComplete?.(quizSetData.id, tags.join(', '));
      onClose();

    } catch (error) {
      console.error('Error saving quiz set:', error);
      // alert("Failed to save quiz set. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="text-gray-200 fixed inset-0 bg-black/40 backdrop-blur-md shadow-2xl flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-xl max-h-80vh overflow-y-hidden">
        <h2 className="text-xl font-semibold mb-4">Save Quiz Set</h2>

        {/* Quiz Set Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Quiz Set Title</label>
          <input
            type="text"
            value={quizSetTitle}
            onChange={(e) => setQuizSetTitle(e.target.value)}
            placeholder="Enter title"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>

        {/* Folder Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Save to Folder</label>
          
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="existing-folder"
              checked={!createNewFolder}
              onChange={() => setCreateNewFolder(false)}
              className="mr-2"
            />
            <label htmlFor="existing-folder">Existing Folder</label>
          </div>

          {!createNewFolder && (
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white mb-2"
            >
              <option value="">Select a folder</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.title}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="new-folder"
              checked={createNewFolder}
              onChange={() => setCreateNewFolder(true)}
              className="mr-2"
            />
            <label htmlFor="new-folder">New Folder</label>
          </div>

          {createNewFolder && (
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          )}
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag"
              className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-600 px-2 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-xs hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveQuiz}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Quiz Set'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Usage in your quiz component:
const QuizComponent = () => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  // Your quiz generation logic here...

  return (
    <div>
      {/* Your quiz UI */}
      <button
        onClick={() => setShowSaveModal(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Save Quiz Set
      </button>

      <SaveQuizModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        quizData={quizData}
        summaryData={summaryData}
        onSaveComplete={(quizSetId) => {
          console.log("Quiz set saved with ID:", quizSetId);
          // Optional: navigate to the saved quiz or show success message
        }}
      />
    </div>
  );
};

export default SaveQuizModal;