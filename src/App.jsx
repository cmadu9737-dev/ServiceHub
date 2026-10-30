
import { Routes, Route } from "react-router-dom";
import Navbar from "./Component/Navbar.jsx";
import LandingPageScreen from "./Screen/LandingPageScreen.jsx";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPageScreen />} />
      </Routes>
    </>
  );
}

export default App;
