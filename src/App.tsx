import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import QueuePage from "./pages/QueuePage";
import GadisManisPage from "./pages/GadisManisPage";
import SurveiKepuasanPage from "./pages/SurveiKepuasanPage";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/antrian/:id" element={<QueuePage />} />
        <Route path="/gadis-manis" element={<GadisManisPage />} />
        <Route path="/survey" element={<SurveiKepuasanPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;