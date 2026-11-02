
import { Routes, Route } from "react-router-dom";
import Navbar from "./Component/Navbar.jsx";
import LandingPageScreen from "./Screen/LandingPageScreen.jsx";
import HowItWorks from "./Screen/HowItWorks.jsx";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPageScreen />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
    </>
  );
}

export default App;
