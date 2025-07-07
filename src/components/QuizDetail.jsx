import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function QuizDetail() {
    
    const { id } = useParams();
    const { userLoggedIn, currentUser } = useAuth();
    const navigate = useNavigate();
    const [quizQuestions, setQuizQuestions] = useState(null);
    const [quizSummary, setQuizSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchQuizQuestions = async () => {
            try {
                const { data, error } = await supabase
                    .from('quizzes')
                    .select('quiz_data')
                    .eq('quiz_set_id', id);
                if (error) throw error;
                console.log('data 1', data[0].quiz_data);
                for (let i = 0; i < data[0].quiz_data.length; i++) {
                    console.log('within loop', data[0].quiz_data[i]);
                    console.log('within loop index', i);
                };
                console.log('data 2', data);
                console.log('data 3', data[0]);
                console.log('data 4', data[0].quiz_data);
                console.table(data[0].quiz_data);
                setQuizQuestions(data[0].quiz_data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching quiz:', error);
                setLoading(false);
            }

        };

        if (userLoggedIn) {
            fetchQuizQuestions();
        }
    }, [userLoggedIn, id]);
    
    useEffect(() => {
        const fetchQuizSummary = async () => {
            try {
                const { data, error } = await supabase
                    .from('summaries')
                    .select('summary_content')
                    .eq('quiz_set_id', id);
                if (error) throw error;
                console.log(data[0].summary_content);
                setQuizSummary(data[0].summary_content);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching quiz summary:', error);
                setLoading(false);
            }

        };

        if (userLoggedIn) {
            fetchQuizSummary();
        }
    }, [userLoggedIn, id]);
    
    if (loading) {
        return <div className="container mx-auto p-4 text-gray-200">
            <div className="animate-pulse">
                <div className="h-8 w-48 bg-gray-500 rounded mb-4"></div>
                <div className="h-6 w-64 bg-gray-500 rounded"></div>
            </div>
        </div>;
    }

    if (!quizSummary || !quizQuestions) {
        return <div className="container mx-auto p-4 text-gray-200">
            <p>No quiz data available</p>
        </div>;
    }

    return (
        <div className="container mx-auto p-4 text-gray-200">
            <h1>just vibes</h1>
        </div>
    );
}