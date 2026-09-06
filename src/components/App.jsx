import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "../App.css";
import NavBar from "./NavBar";
import Home from "../pages/Home";
import Meet from "../pages/Meet";
import Assistant from "../pages/Assistant";
import Agent from "../pages/Agent";
import Vision from "../pages/Vision";
import About from "../pages/About";

// Main Application Component
function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <main className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meet" element={<Meet />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/agent" element={<Agent />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/about" element={<About />} />
          {/* Unknown routes redirect home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

// Export Component
export default App;
