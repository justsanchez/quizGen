import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase/client";
import { Link } from "react-router-dom";

import { disableScroll, enableScroll } from "../helper/scrollLock";

export default function Library() {
    const { userLoggedIn, currentUser } = useAuth();
    const [foldersData, setFoldersData] = useState([]);
    const [quizSets, setQuizSets] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

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
                .in('folder_id', folderIds);

                if (quizSetsError) throw quizSetsError;

                // Optional: If you want to keep the original separate states too
                setFoldersData(folders || []);
                setQuizSets(quizSets || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userLoggedIn, currentUser]);

    const handleFolderClick = (folder) => {
        setSelectedFolder(folder);
        setShowModal(true);
        setMenuOpen(null);
    };

    const [menuOpen, setMenuOpen] = useState(null); // Track which menu is open

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
    const [editingFolder, setEditingFolder] = useState(null);
    const [editFolderName, setEditFolderName] = useState("");

    // Scroll lock when modal is open
    useEffect(() => {
        if (editingFolder) {
            disableScroll();
        } else {
            enableScroll();
        }

        return () => {
            enableScroll();
        };
    }, [editingFolder]);

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

   

    useEffect(() => {
        const openModals = [editingFolder, menuOpen, showModal].filter(Boolean);
        if (openModals.length === 0) return;
    
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (editingFolder) handleCancelEdit();
                if (menuOpen) setMenuOpen(null);
                if (showModal) setShowModal(false);
            }
        };
    
        const handleClickOutside = (e) => {
            const modals = [
                { state: editingFolder, selector: '.edit-folder-modal', action: handleCancelEdit },
                { state: menuOpen, selector: '.folder-modal', action: () => setMenuOpen(null) },
                { state: showModal, selector: '.show-folder-modal', action: () => setShowModal(false) }
            ];
    
            modals.forEach(({ state, selector, action }) => {
                if (state && !e.target.closest(selector)) {
                    action();
                }
            });
        };
    
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editingFolder, menuOpen, showModal]);
    




    // ! this function is used to get the quiz sets in a specific folder
    // TODO: can we make this more efficient? and also can we can just add this logic at the end of the fetchData function?
    const getQuizSetsInFolder = (folderId) => {
        return quizSets.filter(quizSet => quizSet.folder_id === folderId);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 text-gray-200">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-500 rounded mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* TODO: make this more dynamic in the future */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-4 border rounded-lg bg-gray-700 h-32"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 text-gray-200">
            <h1 className="text-2xl font-bold mb-6">Your Library</h1>
            
            {foldersData.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📁</div>
                    <p className="text-gray-400">No folders yet. Create your first folder to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" >
                    {foldersData.map((folder) => {
                    const folderQuizSets = getQuizSetsInFolder(folder.id);
                    return (
                        <div 
                            key={folder.id} 
                            onClick={() => !editingFolder && handleFolderClick(folder)}
                            className="folder-modal flex flex-col justify-between p-4 border border-gray-600 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group relative"                        >
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
                                            <div className="absolute left-0 bottom-5 mt-1 w-32 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-20"
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
                                                <button
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
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 mt-auto">
                                {folderQuizSets.length} quiz set{folderQuizSets.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    );
                })}
            </div>

        )}
            {/* Folder Modal */}
            {showModal && selectedFolder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md shadow-2xl flex items-center justify-center p-4 z-50">
                    <div className="show-folder-modal bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-80vh overflow-hidden">
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
                                <div className="grid gap-2 max-h-96 overflow-y-auto">
                                    {getQuizSetsInFolder(selectedFolder.id).map((quizSet) => (
                                        <Link
                                            key={quizSet.id}
                                            to={`/quiz/${quizSet.id}`}
                                            className="block p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
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
                                            {/* {quizSet.tags && quizSet.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {quizSet.tags.slice(0, 3).map((tag, index) => (
                                                        <span 
                                                            key={index}
                                                            className="text-xs bg-blue-600 px-2 py-1 rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {quizSet.tags.length > 3 && (
                                                        <span className="text-xs text-gray-400">
                                                            +{quizSet.tags.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )} */}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}