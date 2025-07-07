import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../firebase/auth";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase/client";
import { Link } from "react-router-dom";

export default function Library() {
    const { userLoggedIn, currentUser } = useAuth();

    const [library, setLibrary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                console.log(currentUser.uid);
                const { data, error } = await supabase
                    .from('quiz_sets')
                    .select('*')
                    .eq('user_id', currentUser.uid);
                if (error) throw error;
                console.log(data);
                setLibrary(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching library:', error);
                setLoading(false);
            }
        };

        if (userLoggedIn) {
            fetchLibrary();
        }
    }, [userLoggedIn, currentUser]);

    return (
        <div className="container mx-auto p-4 text-gray-200">
            <h1>Library</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {library.map((item) => (
                        <div key={item.id} className="p-4 border rounded-lg">
                            {/* i need them to be clickable */}
                            <Link to={`/quiz/${item.id}`}>
                                <h3>{item.title}</h3>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}