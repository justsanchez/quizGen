import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase/client";
import { Link } from "react-router-dom";

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
    };

    // ! this function is used to get the quiz sets in a specific folder
    // TODO: can we make this more efficient? and also can we can just add it to the end of the fetchData function?
    const getQuizSetsInFolder = (folderId) => {
        return quizSets.filter(quizSet => quizSet.folder_id === folderId);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 text-gray-200">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-500 rounded mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {foldersData.map((folder) => {
                        const folderQuizSets = getQuizSetsInFolder(folder.id);
                        return (
                            <div 
                                key={folder.id} 
                                onClick={() => handleFolderClick(folder)}
                                className="p-4 border border-gray-600 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors group"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="text-2xl mr-3 group-hover:text-yellow-400 transition-colors">
                                        📁
                                    </div>
                                    <h3 className="font-semibold text-lg truncate">
                                        {folder.title}
                                    </h3>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                <p className="text-sm text-gray-400">
                                    {folderQuizSets.length} quiz set{folderQuizSets.length !== 1 ? 's' : ''}
                                </p>
                                <p className="text-sm text-gray-400">
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
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md shadow-2xl flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-80vh overflow-hidden">
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