import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import PromptSection from "./components/PromptPage";
import AIQuizNotes from "./components/AIQuizNotes";
import LandingPage from "./components/LandingPage";
import ScrollToTop from "./components/ScrollToTop";
import LearnMore from "./components/LearnMore";
import Library from "./components/Library";
import Settings from "./components/Settings";
import Profile from "./components/Profile";

// Quiz Detail - 
import QuizDetail from "./components/QuizDetail";

import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Layouts
import Layout from "./components/layouts/Layout";

// Landing Page Navbar
import Navbar from "./components/NavBar";

// Firebase Auth
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import { ToastContainer } from "react-toastify";

// Toast Messages
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from './contexts/AuthContext';
import { DevelopingFlagProvider } from './contexts/DevelopingFlag';


// Layout component for routes with Navbar
const LayoutWithNavbar = () => {
  return (
    <>
      <Layout />
      <main className="flex-1 w-full p-0 m-0">
       {/* <Outlet /> */}
      </main>
    </>
  );
};

// Layout component for routes without Navbar
const LandingPageNavbar = () => {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full p-0 m-0">
        <Outlet />
      </main>
    </>
  );
};

export default function App() {

  return (
    <div className="w-screen min-h-screen flex flex-col bg-gray-900">
      <AuthProvider>
        <DevelopingFlagProvider>
        <ScrollToTop />
        <Routes>
          {/* Routes with Navbar */}
          <Route element={<LayoutWithNavbar />}>
            <Route path="/prompt" element={<PromptSection />} />
            <Route path="/quizNotes" element={<AIQuizNotes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/library" element={<Library />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/layout" element={<Layout />} />
            <Route path="/quiz/:id" element={<QuizDetail />} />
          </Route>

          {/* Routes without Navbar */}
          <Route element={<LandingPageNavbar />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/learn-more" element={<LearnMore />} />
          </Route>    


            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
        {/* Toast container for notifications */}
        <ToastContainer position="top-right" autoClose={2500} />
      </DevelopingFlagProvider>
      </AuthProvider>
    </div>
  );
}