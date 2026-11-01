import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  Search,
  MapPin,
  Handshake,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  UserRound,
  CalendarDays,
  BriefcaseBusiness,
  Clock,
  LogOut,
} from "lucide-react";

import { supabase } from "../supabaseClient";
import logo from "../assets/ServeHublogo.png";
import "./Navbar.css";

const locations = {
  Lagos: ["Ikeja", "Lekki", "Yaba", "Surulere"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Eleme"],
  FCT: ["Abuja Municipal", "Gwagwalada", "Kuje"],
  Oyo: ["Ibadan", "Ogbomosho", "Oyo"],
  Kano: ["Kano Municipal", "Fagge", "Nassarawa"],
  Edo: ["Benin City", "Auchi", "Ekpoma"],
};

function Navbar() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const availableCities = state ? locations[state] || [] : [];
  const isProvider = profile?.role === "provider";

  useEffect(() => {
    let mounted = true;

    const loadProfile = async (session) => {
      if (!session?.user) {
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
        return;
      }

      if (mounted) setUser(session.user);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role, avatar_url")
        .eq("id", session.user.id)
        .maybeSingle();

      if (mounted && !error) {
        setProfile(data);
      }
    };

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!error && mounted) {
        await loadProfile(data.session);
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      Promise.resolve().then(() => {
        if (mounted) loadProfile(session);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const closeMenus = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) params.set("q", search.trim());
    if (country) params.set("country", country);
    if (state) params.set("state", state);
    if (city) params.set("city", city);

    navigate(`/services?${params.toString()}`);
    closeMenus();
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }

    closeMenus();
    navigate("/", { replace: true });
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="navbar">
      <div className="navbar-main">
        {/* BRAND */}
        <Link
          to="/"
          className="navbar-brand"
          aria-label="ServeHub home"
          onClick={closeMenus}
        >
          <img src={logo} alt="ServeHub" />
        </Link>

        {/* SEARCH */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <Search className="search-icon" size={19} />

          <input
            type="search"
            placeholder="Search services, experts and professionals..."
            aria-label="Search services"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="location-selectors">
            <MapPin size={17} />

            <select
              aria-label="Country"
              value={country}
              onChange={(event) => {
                setCountry(event.target.value);
                setState("");
                setCity("");
              }}
            >
              <option value="Nigeria">Nigeria</option>
            </select>

            <select
              aria-label="State"
              value={state}
              onChange={(event) => {
                setState(event.target.value);
                setCity("");
              }}
            >
              <option value="">State</option>

              {Object.keys(locations).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              aria-label="City"
              value={city}
              disabled={!state}
              onChange={(event) => setCity(event.target.value)}
            >
              <option value="">City</option>

              {availableCities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button className="search-submit" type="submit" aria-label="Search">
            <Search size={19} />
          </button>
        </form>

        {/* DESKTOP ACCOUNT LINKS */}
        <nav className="navbar-actions">
          {!user ? (
            <>
              <NavLink to="/become-a-member" className="member-link">
                <Handshake size={17} />
                Become a Member
              </NavLink>

              <NavLink to="/login" className="login-link">
                Login
              </NavLink>

              <NavLink to="/signup" className="signup-btn">
                Get Started
              </NavLink>
            </>
          ) : (
            <div className="account-wrapper">
              <button
                type="button"
                className={`account-trigger ${accountOpen ? "active" : ""}`}
                onClick={() => setAccountOpen((previous) => !previous)}
                aria-expanded={accountOpen}
              >
                <span className="account-avatar">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" />
                  ) : (
                    initials
                  )}
                </span>

                <span className="account-info">
                  <strong>{profile?.full_name || "My Account"}</strong>
                  <small>{isProvider ? "Provider" : "Customer"}</small>
                </span>

                <ChevronDown size={17} className="account-chevron" />
              </button>

              {accountOpen && (
                <div className="account-dropdown">
                  <div className="dropdown-heading">
                    <span className="dropdown-avatar">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" />
                      ) : (
                        initials
                      )}
                    </span>

                    <span>
                      <strong>{profile?.full_name || "Welcome"}</strong>
                      <small>
                        {isProvider ? "Provider Account" : "Customer Account"}
                      </small>
                    </span>
                  </div>

                  <div className="dropdown-links">
                    <Link
                      to={isProvider ? "/provider-dashboard" : "/customer-dashboard"}
                      onClick={closeMenus}
                    >
                      <LayoutDashboard size={17} />
                      My Dashboard
                    </Link>

                    <Link
                      to={isProvider ? "/provider/profile" : "/customer-dashboard"}
                      onClick={closeMenus}
                    >
                      <UserRound size={17} />
                      My Profile
                    </Link>

                    {isProvider ? (
                      <>
                        <Link to="/provider/edit-service" onClick={closeMenus}>
                          <BriefcaseBusiness size={17} />
                          My Services
                        </Link>

                        <Link to="/provider/bookings" onClick={closeMenus}>
                          <CalendarDays size={17} />
                          Booking Requests
                        </Link>

                        <Link to="/provider/availability" onClick={closeMenus}>
                          <Clock size={17} />
                          Availability & Status
                        </Link>
                      </>
                    ) : (
                      <Link to="/customer-dashboard" onClick={closeMenus}>
                        <CalendarDays size={17} />
                        My Bookings
                      </Link>
                    )}
                  </div>

                  <div className="dropdown-bottom">
                    <button
                      type="button"
                      className="logout-button"
                      onClick={handleLogout}
                    >
                      <LogOut size={17} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      {menuOpen && (
        <div className="mobile-navigation">
          {!user ? (
            <>
              <Link to="/become-a-member" onClick={closeMenus}>
                <Handshake size={18} />
                Become a Member
              </Link>

              <Link to="/login" onClick={closeMenus}>
                Login
              </Link>

              <Link to="/signup" className="mobile-signup" onClick={closeMenus}>
                Get Started
              </Link>
            </>
          ) : (
            <>
              <div className="mobile-account">
                <span className="account-avatar">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" />
                  ) : (
                    initials
                  )}
                </span>

                <span>
                  <strong>{profile?.full_name || "My Account"}</strong>
                  <small>{isProvider ? "Provider" : "Customer"}</small>
                </span>
              </div>

              <Link
                to={isProvider ? "/provider-dashboard" : "/customer-dashboard"}
                onClick={closeMenus}
              >
                <LayoutDashboard size={18} />
                My Dashboard
              </Link>

              <Link
                to={isProvider ? "/provider/profile" : "/customer-dashboard"}
                onClick={closeMenus}
              >
                <UserRound size={18} />
                My Profile
              </Link>

              {isProvider ? (
                <>
                  <Link to="/provider/edit-service" onClick={closeMenus}>
                    <BriefcaseBusiness size={18} />
                    My Services
                  </Link>

                  <Link to="/provider/bookings" onClick={closeMenus}>
                    <CalendarDays size={18} />
                    Booking Requests
                  </Link>

                  <Link to="/provider/availability" onClick={closeMenus}>
                    <Clock size={18} />
                    Availability & Status
                  </Link>
                </>
              ) : (
                <Link to="/customer-dashboard" onClick={closeMenus}>
                  <CalendarDays size={18} />
                  My Bookings
                </Link>
              )}

              <button
                type="button"
                className="mobile-logout"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;