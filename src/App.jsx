
import { Routes, Route } from "react-router-dom";
import Navbar from "./Component/Navbar.jsx";
import LandingPageScreen from "./Screen/LandingPageScreen.jsx";
import BecomeMember from "./Screen/BecomeMember.jsx";
import Signup from "./Screen/Signup.jsx";
import CustomerSignup from "./Screen/CustomerSignup.jsx";
import ProviderSignup from "./Screen/ProviderSignup.jsx";
import Login from "./Screen/Login.jsx";
import CustomerDashboard from "./Screen/CustomerDashboard.jsx";
import ProviderDashboard from "./Screen/ProviderDashboard.jsx";
import ServicesPage from "./Screen/ServicesPage.jsx";
import ServiceDetails from "./Screen/ServiceDetails.jsx";
import BookingChat from "./Screen/BookingChat.jsx";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPageScreen />} />
        <Route path="/become-a-member" element={<BecomeMember />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/customer" element={<CustomerSignup />} />
        <Route path="/signup/provider" element={<ProviderSignup />} />

        <Route path="/services" element={<ServicesPage />} />
        <Route path="/service/:id" element={<ServiceDetails />} />

        <Route path="/login" element={<Login />} />

        <Route path="/customer-dashboard" element={<CustomerDashboard />} />

        <Route path="/provider-dashboard" element={<ProviderDashboard />} />

        <Route path="/provider/:section"  element={<ProviderDashboard />}  />
        <Route path="/booking-chat/:bookingId" element={<BookingChat />} />
      </Routes>
    </>
  );
}

export default App;
