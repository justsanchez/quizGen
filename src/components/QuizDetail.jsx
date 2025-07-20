// todo: might consolidate this with the library page
// this page just loads the quiz data from the database and then sends it to the AIQuizNotes page

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useAuth } from "../contexts/AuthContext";

// Cache key generator
const getCacheKey = (id, type) => `quiz_cache_${id}_${type}`;

export default function QuizDetail() {
    const { id } = useParams();
    const { userLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userLoggedIn) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Check cache first
                const cachedQuiz = localStorage.getItem(getCacheKey(id, 'quiz'));
                const cachedSummary = localStorage.getItem(getCacheKey(id, 'summary'));

                if (cachedQuiz && cachedSummary) {
                    // navigateWithData(JSON.parse(cachedQuiz), JSON.parse(cachedSummary));
                    // return;
                }

                // Fetch fresh data if no cache
                const [quizRes, summaryRes] = await Promise.all([
                    supabase.from('quizzes').select('quiz_data').eq('quiz_set_id', id),
                    supabase.from('summaries').select('summary_content').eq('quiz_set_id', id)
                ]);

                if (quizRes.error || summaryRes.error) throw new Error('Fetch failed');

                console.log('quizRes', quizRes.data[0].quiz_data);
                console.log('summaryRes', summaryRes.data[0].summary_content);

                // Cache the data
                localStorage.setItem(
                    getCacheKey(id, 'quiz'),
                    JSON.stringify(quizRes.data[0].quiz_data)
                );
                localStorage.setItem(
                    getCacheKey(id, 'summary'),
                    JSON.stringify(summaryRes.data[0].summary_content)
                );

                navigateWithData(quizRes.data[0].quiz_data, summaryRes.data[0].summary_content);
            } catch (error) {
                console.error('Error:', error);
                navigate('/error'); // Add your error handling route
            } finally {
                setLoading(false);
            }
        };

        const navigateWithData = (quizData, summaryData) => {
            console.log('quizData | Look at me', JSON.stringify(quizData));
            console.log('summaryData | Look at me', JSON.stringify(summaryData));
            navigate("/quizNotes", {
                state: {
                    transcript: '',
                    specialInstructions: '',
                    model: '',
                    difficulty: '',
                    numQuestions: '',
                    mode: 'load',
                    quizFetch: quizData,
                    summaryFetch: summaryData
                },
                replace: true // Prevents back button issues
            });
        };

        fetchData();
    }, [userLoggedIn, id, navigate]);

    if (loading) {
        return (
            <div className="container mx-auto p-4 text-gray-200">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-500 rounded mb-4"></div>
                    <div className="h-6 w-64 bg-gray-500 rounded"></div>
                </div>
            </div>
        );
    }

    return null; // This component doesn't render anything visible
}