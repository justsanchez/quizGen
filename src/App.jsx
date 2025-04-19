import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import PromptSection from "./components/PromptPage";
import AIQuizNotes from "./components/AIQuizNotes";
import LandingPage from "./components/LandingPage";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./components/auth/login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <div className="w-screen min-h-screen flex flex-col bg-gray-900">
      <AuthProvider>
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 w-full p-0 m-0">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/prompt" element={<PromptSection />} />
          <Route path="/quizNotes" element={<AIQuizNotes />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      {/* Toast container for notifications */}
      <ToastContainer position="top-right" autoClose={2500} />
      </AuthProvider>
    </div>
  );
}