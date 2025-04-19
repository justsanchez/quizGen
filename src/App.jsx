import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/NavBar";
import PromptSection from "./components/PromptPage";
import AIQuizNotes from "./components/AIQuizNotes";
import LandingPage from "./components/LandingPage";
import ScrollToTop from "./components/ScrollToTop";

// Firebase Auth
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import { ToastContainer } from "react-toastify";

// Toast Messages
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from './contexts/AuthContext';

// Layout component for routes with Navbar
const LayoutWithNavbar = () => {
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
        <ScrollToTop />
        <Routes>
          {/* Routes with Navbar */}
          <Route element={<LayoutWithNavbar />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/prompt" element={<PromptSection />} />
            <Route path="/quizNotes" element={<AIQuizNotes />} />
          </Route>

          {/* Routes without Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        {/* Toast container for notifications */}
        <ToastContainer position="top-right" autoClose={2500} />
      </AuthProvider>
    </div>
  );
}