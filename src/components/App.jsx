import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./NavBar";
import QuizPage from "./QuizAndNotesPage";
import LandingPage from "./LandingPage";

export default function App() {
  return (

      <div className="w-screen min-h-screen flex flex-col bg-gray-900">
        <Navbar />
        <main className="flex-1 w-full p-0 m-0 ">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/QuizPage" element={<QuizPage />} />
          </Routes>
        </main>
      </div>

  );
}