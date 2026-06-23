import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase/client";
import { Link } from "react-router-dom";

import { disableScroll, enableScroll } from "../helper/scrollLock";
import { normalizeTags } from "../helper/quizHelper";

/**
 * `/library` page. Fetches the signed-in user's folders and quiz sets from
 * Supabase and renders each folder as a card. Clicking a folder opens a
 * modal that lists its quiz sets with tag- and title-based filtering.
 * Folders can be renamed in place; folder deletion is stubbed (see
 * `handleDeleteFolder`).
 *
 * @component
 * @returns {JSX.Element}
 */
export default function Library() {
    const { userLoggedIn, currentUser } = useAuth();
    const [foldersData, setFoldersData] = useState([]);
    const [quizSets, setQuizSets] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);


    const [allTags, setAllTags] = useState([]);
    const [tagsToQuizSetMap, setTagsToQuizSetMap] = useState({});


    const [editingFolder, setEditingFolder] = useState(null);
    const [editFolderName, setEditFolderName] = useState("");

    const [selectedTag, setSelectedTag] = useState("");
    const [tagFilter, setTagFilter] = useState("");
    const [selectedTitle, setSelectedTitle] = useState("");

    const [menuOpen, setMenuOpen] = useState(null); // Track which folder menu is open

    // Per-quiz options menu + edit state
    const [quizMenuOpen, setQuizMenuOpen] = useState(null); // quizSet.id whose menu is open
    const [editingQuiz, setEditingQuiz] = useState(null);   // quizSet being renamed
    const [editQuizTitle, setEditQuizTitle] = useState("");
    const [taggingQuiz, setTaggingQuiz] = useState(null);   // quizSet whose tags are being edited
    const [editQuizTags, setEditQuizTags] = useState("");   // comma-separated tag input

    // Whichever quiz modal (rename/tags) is open shares this input ref so we can
    // explicitly move focus into it on open — `autoFocus` alone is unreliable
    // here, and without focus inside the modal an Enter keypress activates the
    // still-focused quiz <Link> underneath, navigating away and closing the page.
    const quizInputRef = useRef(null);



    

    useEffect(() => {
        const fetchData = async () => {
            if (!userLoggedIn) return;

            try {
                // First get the user folder
                const { data: userFolders, error: userFolderError } = await supabase
                .from('userFolder')
                .select('*')
                .eq('user_id', currentUser.uid);

                if (userFolderError) throw userFolderError;
                if (!userFolders || userFolders.length === 0) {
                console.log('No user folder found');
                return;
                }

                console.log('User folder:', JSON.stringify(userFolders, null, 2));

                const userFolderId = userFolders[0].id;

                let folderMap = new Map();

                // Then get folders and quiz sets
                const { data: folders, error: foldersError } = await supabase
                .from('folder')
                .select('*')
                .eq('userFolder', userFolderId);

                if (foldersError) throw foldersError;
                if (!folders || folders.length === 0) {
                console.log('No folders found in this user folder');
                return;
                }

                console.log('Folders under user folder:', JSON.stringify(folders, null, 2));

                // Get all folder IDs to use in fetching the quiz sets
                const folderIds = folders.map(folder => folder.id);

                // Then get quiz sets for each folder
                const { data: quizSets, error: quizSetsError } = await supabase
                .from('quiz_sets')
                .select('*')
                .in('folder_id', folderIds)
                .order('created_at', { ascending: true });

                if (quizSetsError) throw quizSetsError;

                // Map each quiz set to its tags
                const tagsToQuizSetMap = {};

                for (const quizSet of quizSets) {
                if (!quizSet.tags) continue;

                let tagList = [];

                if (Array.isArray(quizSet.tags)) {
                    tagList = quizSet.tags;
                } else if (typeof quizSet.tags === 'string') {
                    tagList = quizSet.tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(Boolean);
                }

                // Store tags associated with this quiz set
                tagsToQuizSetMap[quizSet.folder_id] = tagList;
                }
                  

                // Optional: If you want to keep the original separate states too
                setFoldersData(folders || []);
                setQuizSets(quizSets || []);
                setTagsToQuizSetMap(tagsToQuizSetMap);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userLoggedIn, currentUser]);

    
    const handleTagSelect = (event) => {
      const selected = event.target.value;
      setSelectedTag(selected);
      setTagFilter(selected); // triggers filtering logic
    };

    const handleFolderClick = (folder) => {
        setSelectedFolder(folder);
        setShowModal(true);
        setMenuOpen(null);
    };


    // =============== Getters ===============
    // ! this function is used to get the quiz sets in a specific folder
    // TODO: can we make this more efficient? and also can we can just add this logic at the end of the fetchData function?
    const getQuizSetsInFolder = (folderId) => {
        return quizSets.filter(quizSet => quizSet.folder_id === folderId);
    };

    const getFilteredQuizSetsInFolder = (folderId) => {
        const quizSets = getQuizSetsInFolder(folderId);
      
        // if no filters applied, show all quiz sets
        if (
          (!selectedTag || selectedTag.trim() === "") &&
          (!selectedTitle || selectedTitle.trim() === "")
        ) {
          return quizSets;
        }
      
        return quizSets.filter((quizSet) => {
          let tagMatch = true;
          let titleMatch = true;
      
          // TAG FILTER
          if (selectedTag && selectedTag.trim() !== "") {
            if (Array.isArray(quizSet.tags)) {
              tagMatch = quizSet.tags.some((tag) =>
                tag.toLowerCase().includes(selectedTag.toLowerCase())
              );
            } else if (typeof quizSet.tags === "string") {
              tagMatch = quizSet.tags
                .split(",")
                .map((t) => t.trim().toLowerCase())
                .includes(selectedTag.toLowerCase());
            } else {
              tagMatch = false;
            }
          }
      
          // TITLE FILTER
          if (selectedTitle && selectedTitle.trim() !== "") {
            titleMatch = quizSet.title
              ?.toLowerCase()
              .includes(selectedTitle.toLowerCase());
          }
      
          return tagMatch && titleMatch;
        });
      };


    // Function to handle folder deletion
    const handleDeleteFolder = async (folder) => {
        return; // ! not supported yet
        // if (!window.confirm(`Are you sure you want to delete "${folder.title}"? This will also delete all quiz sets inside.`)) {
        //     return;
        // }

        // try {
        //     const { error } = await supabase
        //         .from('folders')
        //         .delete()
        //         .eq('id', folder.id);

        //     if (error) throw error;

        //     // Remove from local state
        //     setFoldersData(prev => prev.filter(f => f.id !== folder.id));
            
        //     // Close modal if the deleted folder was open
        //     if (selectedFolder?.id === folder.id) {
        //         setShowModal(false);
        //         setSelectedFolder(null);
        //     }

        // } catch (error) {
        //     console.error('Error deleting folder:', error);
        //     alert('Failed to delete folder');
        // }
    };

    // Scroll lock when modal is open
    useEffect(() => {
        if (editingFolder || editingQuiz || taggingQuiz) {
            disableScroll();
        } else {
            enableScroll();
        }

        return () => {
            enableScroll();
        };
    }, [editingFolder, editingQuiz, taggingQuiz]);

    // Pull focus into the quiz modal's input once it has mounted, so keyboard
    // input (and Enter) is captured by the modal rather than the page beneath it.
    useEffect(() => {
        if (editingQuiz || taggingQuiz) {
            quizInputRef.current?.focus();
        }
    }, [editingQuiz, taggingQuiz]);

    const handleEditFolder = (folder) => {
        setEditingFolder(folder);
        setEditFolderName(folder.title);
    };

    const handleSaveFolderName = async () => {
        if (!editingFolder || !editFolderName.trim()) return;

        try {
            const { error } = await supabase
                .from('folder')
                .update({ title: editFolderName.trim() })
                .eq('id', editingFolder.id);

            if (error) throw error;

            // Update local state
            setFoldersData(prev => prev.map(folder => 
                folder.id === editingFolder.id 
                    ? { ...folder, title: editFolderName.trim() }
                    : folder
            ));

            // Also update selectedFolder if it's the one being edited
            if (selectedFolder?.id === editingFolder.id) {
                setSelectedFolder(prev => ({ ...prev, title: editFolderName.trim() }));
            }

            setEditingFolder(null);
            setEditFolderName("");
            setMenuOpen(null);

        } catch (error) {
            console.error('Error updating folder name:', error);
            alert('Failed to update folder name');
        }
    };

    const handleCancelEdit = () => {
        setEditingFolder(null);
        setEditFolderName("");
        setMenuOpen(null);
    };

    // =============== Quiz set: rename + tags ===============

    /** Recompute the union of tags across a folder's quiz sets (drives the filter dropdown). */
    const recomputeFolderTags = (sets, folderId) => {
        const union = [...new Set(
            sets.filter(q => q.folder_id === folderId).flatMap(q => normalizeTags(q.tags))
        )];
        setTagsToQuizSetMap(prev => ({ ...prev, [folderId]: union }));
    };

    // ---- Rename ----
    const handleEditQuiz = (quizSet) => {
        setEditingQuiz(quizSet);
        setEditQuizTitle(quizSet.title || "");
        setQuizMenuOpen(null);
    };

    const handleSaveQuizName = async () => {
        if (!editingQuiz || !editQuizTitle.trim()) return;

        try {
            const newTitle = editQuizTitle.trim();
            const { error } = await supabase
                .from('quiz_sets')
                .update({ title: newTitle })
                .eq('id', editingQuiz.id);

            if (error) throw error;

            setQuizSets(prev => prev.map(q =>
                q.id === editingQuiz.id ? { ...q, title: newTitle } : q
            ));

            handleCancelEditQuiz();
        } catch (error) {
            console.error('Error updating quiz name:', error);
            alert('Failed to update quiz name');
        }
    };

    const handleCancelEditQuiz = () => {
        setEditingQuiz(null);
        setEditQuizTitle("");
        setQuizMenuOpen(null);
    };

    // ---- Tags ----
    const handleTagQuiz = (quizSet) => {
        setTaggingQuiz(quizSet);
        setEditQuizTags(normalizeTags(quizSet.tags).join(", "));
        setQuizMenuOpen(null);
    };

    const handleSaveQuizTags = async () => {
        if (!taggingQuiz) return;

        try {
            const tagArray = normalizeTags(editQuizTags);
            // The `tags` column is a text column, so store a plain comma-separated
            // string. Persisting a JS array here serializes to `["a","b"]`, which
            // then renders with stray brackets/quotes.
            const tagString = tagArray.join(", ");
            const { error } = await supabase
                .from('quiz_sets')
                .update({ tags: tagString })
                .eq('id', taggingQuiz.id);

            if (error) throw error;

            const updated = quizSets.map(q =>
                q.id === taggingQuiz.id ? { ...q, tags: tagString } : q
            );
            setQuizSets(updated);
            recomputeFolderTags(updated, taggingQuiz.folder_id);

            handleCancelTagQuiz();
        } catch (error) {
            console.error('Error updating quiz tags:', error);
            alert('Failed to update quiz tags');
        }
    };

    const handleCancelTagQuiz = () => {
        setTaggingQuiz(null);
        setEditQuizTags("");
        setQuizMenuOpen(null);
    };



    useEffect(() => {
        const openModals = [editingFolder, menuOpen, showModal, quizMenuOpen, editingQuiz, taggingQuiz].filter(Boolean);
        if (openModals.length === 0) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                // Close the most specific overlay first
                if (editingQuiz) return handleCancelEditQuiz();
                if (taggingQuiz) return handleCancelTagQuiz();
                if (quizMenuOpen) return setQuizMenuOpen(null);
                if (editingFolder) handleCancelEdit();
                if (menuOpen) setMenuOpen(null);
                if (showModal) setShowModal(false);
            }
        };

        const handleClickOutside = (e) => {
            // Ordered top-most overlay first. Only the top-most open overlay reacts
            // to an outside-click, so dismissing an upper layer (e.g. Cancel on the
            // quiz modal) doesn't also close the folder modal stacked beneath it.
            const modals = [
                { state: editingQuiz, selector: '.edit-quiz-modal', action: handleCancelEditQuiz },
                { state: taggingQuiz, selector: '.tag-quiz-modal', action: handleCancelTagQuiz },
                { state: quizMenuOpen, selector: '.quiz-menu', action: () => setQuizMenuOpen(null) },
                { state: editingFolder, selector: '.edit-folder-modal', action: handleCancelEdit },
                { state: menuOpen, selector: '.folder-modal', action: () => setMenuOpen(null) },
                { state: showModal, selector: '.show-folder-modal', action: () => setShowModal(false) }
            ];

            const topMost = modals.find(({ state }) => state);
            if (topMost && !e.target.closest(topMost.selector)) {
                topMost.action();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editingFolder, menuOpen, showModal, quizMenuOpen, editingQuiz, taggingQuiz]);


    if (loading) {
        return (
            <div className="container mx-auto p-4 text-gray-200">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-500 rounded mb-4"></div>
                    <div className="grid grid-rows-1 md:grid-rows-2 lg:grid-rows-3 gap-4 max-w-135">
                        {/* TODO: LOADING SKELETON - make this more dynamic in the future */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-4 border rounded-lg bg-gray-700 h-32"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 text-gray-200 max-w-145" >
            <h1 className="text-2xl font-bold mb-6">Your Library</h1>
            
            {foldersData.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📁</div>
                    <p className="text-gray-400">No folders yet. Create your first folder to get started!</p>
                </div>
            ) : (
                <div className="" >
                    {foldersData.map((folder) => {
                    const folderQuizSets = getQuizSetsInFolder(folder.id);
                    return (
                        <div
                            key={folder.id} 
                            onClick={() => !editingFolder && handleFolderClick(folder)}
                            className="folder-modal flex flex-col justify-between p-3 mt-3 mb-3 border border-gray-600 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group relative">
                            {/* Inline Edit Modal */}
                            {editingFolder && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                                    <div 
                                        className="edit-folder-modal bg-gray-800 rounded-lg p-6 w-full max-w-md"
                                    >
                                        <h2 className="text-xl font-semibold mb-4">Edit Folder Name</h2>
                                        
                                        <input
                                            type="text"
                                            value={editFolderName}
                                            onChange={(e) => setEditFolderName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveFolderName();
                                                if (e.key === 'Escape') handleCancelEdit();
                                            }}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            autoFocus
                                            placeholder="Enter folder name"
                                            autoComplete="off"  // 👈 disables browser autofill/autocomplete suggestions
                                        />
                                        
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveFolderName}
                                                disabled={!editFolderName.trim()}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-3 h-full">
                                <div className="text-2xl mr-3 group-hover:text-yellow-400 transition-colors">
                                    📁
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg whitespace-normal">
                                        {folder.title}
                                    </h3>
                                </div>

                                {/* Three-dot menu button - Only show when not editing */}
                                {!editingFolder && (
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuOpen(menuOpen === folder.id ? null : folder.id);
                                            }}
                                            className="p-1 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                            title="Folder options"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>

                                        {/* Dropdown menu */}
                                        {menuOpen === folder.id && (
                                            <div className="absolute right-5 bottom-8 mt-1 w-32 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-20"
                                            onClick={(e) => e.stopPropagation()}
                                            >

                                                <button

                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditFolder(folder);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-600 flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                {/* <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteFolder(folder);
                                                        setMenuOpen(null);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-red-600 text-red-400 hover:text-white flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button> */}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between text-sm text-gray-400 mt-auto">
                                {folderQuizSets.length} quiz set{folderQuizSets.length !== 1 ? 's' : ''}
                                <p className="font-semibold text-s whitespace-normal">
                                        {new Date(folder.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

        )}
            {/* Folder Modal */}
            {showModal && selectedFolder && (
                <div className="fixed inset-0 pr- bg-black/40 backdrop-blur-md shadow-2xl flex items-center justify-center p-4 z-50">
                    <div className="show-folder-modal bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-80vh overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="text-2xl mr-3">📁</div>
                                <h2 className="text-xl font-semibold">{selectedFolder.title}</h2>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="border-t border-gray-700 pt-4">
                            {getQuizSetsInFolder(selectedFolder.id).length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <p>No quiz sets in this folder yet.</p>
                                </div>
                            ) : (
                                <div className="grid gap-2 max-h-120 overflow-y-auto scrollbar-hide pr-2">
                                    {/* <pre className="text-xs text-gray-400 ml-4">
                                        {JSON.stringify(tagsToQuizSetMap[selectedFolder.id], null, 2)}
                                        {JSON.stringify(selectedFolder, null, 2)}
                                    </pre> */}
                                    {/* Filter by tags */}
                                    {tagsToQuizSetMap[selectedFolder.id] && (
                                        <div className="flex items-center gap-2 mt-3 mb-1">
                                            <label htmlFor="tagFilter" className="text-sm text-gray-300 whitespace-nowrap">
                                            Filter by tag:
                                            </label>
                                            <select
                                            id="tagFilter"
                                            value={selectedTag}
                                            onChange={handleTagSelect}
                                            className="p-2 bg-gray-800 text-gray-200 border border-gray-600 rounded-lg focus:outline-none"
                                            >
                                            <option value="">All tags</option>
                                            {tagsToQuizSetMap[selectedFolder.id].map((tag, index) => (
                                                <option key={index} value={tag}>
                                                {tag}
                                                </option>
                                            ))}
                                            </select>
                                            {selectedTag && (
                                            <span className="text-gray-400 hover:text-white text-xl cursor-pointer invert" onClick={() => setSelectedTag("")}>✖️</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Filter by title */}
                                    <div className="mt-3 mb-2">
                                        <label htmlFor="titleFilter" className="text-sm text-gray-300 whitespace-nowrap">
                                        Search by title:
                                        </label>
                                    <input
                                    id="titleFilter"
                                    value={selectedTitle}
                                    placeholder="Enter title here..."
                                    onChange={(e) => setSelectedTitle(e.target.value)}
                                    className="p-2 mb-3 w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md focus:outline-none"
                                    autoComplete="off"  // 👈 disables browser autofill/autocomplete suggestions
                                    />
                                    </div>

                                    {/* getFilteredQuizSetsInFolder */}
                                    {/* getQuizSetsInFolder */}
                                    {getFilteredQuizSetsInFolder(selectedFolder.id).map((quizSet) => {
                                        const quizTags = normalizeTags(quizSet.tags);
                                        return (
                                        <div key={quizSet.id} className="relative group/quiz">
                                            <Link
                                                to={`/quiz/${quizSet.id}`}
                                                className="block p-3 pr-10 border border-gray-600 rounded-lg hover:bg-gray-500"
                                                onClick={() => setShowModal(false)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium truncate">
                                                        {quizSet.title}
                                                    </h4>
                                                    <span className="text-sm text-gray-400">
                                                        {new Date(quizSet.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {quizTags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {quizTags.slice(0, 3).map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="text-xs bg-blue-600 px-2 py-1 rounded-full"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {quizTags.length > 3 && (
                                                            <span className="text-xs text-gray-400">
                                                                +{quizTags.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </Link>

                                            {/* Three-dot quiz options menu */}
                                            <div className="quiz-menu absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setQuizMenuOpen(quizMenuOpen === quizSet.id ? null : quizSet.id);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                                    title="Quiz options"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                    </svg>
                                                </button>

                                                {quizMenuOpen === quizSet.id && (
                                                    <div className="absolute right-0 mt-1 w-36 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-30">
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleEditQuiz(quizSet);
                                                            }}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-600 flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Rename quiz
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleTagQuiz(quizSet);
                                                            }}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-600 flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 9V4a1 1 0 011-1z" />
                                                            </svg>
                                                            Add tags
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })}

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Quiz Modal */}
            {editingQuiz && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="edit-quiz-modal bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Rename Quiz</h2>
                        <input
                            ref={quizInputRef}
                            type="text"
                            value={editQuizTitle}
                            onChange={(e) => setEditQuizTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSaveQuizName();
                                }
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCancelEditQuiz();
                                }
                            }}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter quiz name"
                            autoComplete="off"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancelEditQuiz}
                                className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveQuizName}
                                disabled={!editQuizTitle.trim()}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Quiz Tags Modal */}
            {taggingQuiz && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="tag-quiz-modal bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-1">Edit Tags</h2>
                        <p className="text-sm text-gray-400 mb-4">Separate tags with commas.</p>
                        <input
                            ref={quizInputRef}
                            type="text"
                            value={editQuizTags}
                            onChange={(e) => setEditQuizTags(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSaveQuizTags();
                                }
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCancelTagQuiz();
                                }
                            }}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g. biology, midterm, chapter-3"
                            autoComplete="off"
                        />
                        {/* Live preview of parsed tags */}
                        {normalizeTags(editQuizTags).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                                {normalizeTags(editQuizTags).map((tag, index) => (
                                    <span key={index} className="text-xs bg-blue-600 px-2 py-1 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancelTagQuiz}
                                className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveQuizTags}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                            >
                                Save Tags
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}