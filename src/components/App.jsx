import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./NavBar";
import QuizPage from "./QuizAndNotesPage";
import LandingPage from "./LandingPage";

export default function App() {
  return (
    <>
      <Navbar />
      <div className="p-6">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/QuizPage" element={<QuizPage />} />
        </Routes>
      </div>
    </>
  );
}