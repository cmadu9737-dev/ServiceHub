import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import {
  Search,
  MapPin,
  Handshake,
  Menu,
  X,
} from 'lucide-react'

import logo from '../assets/ServeHublogo.png';
import './Navbar.css'

const locations = {
  Lagos: ['Ikeja', 'Lekki', 'Yaba', 'Surulere'],
  Rivers: ['Port Harcourt', 'Obio-Akpor', 'Eleme'],
  FCT: ['Abuja Municipal', 'Gwagwalada', 'Kuje'],
  Oyo: ['Ibadan', 'Ogbomosho', 'Oyo'],
  Kano: ['Kano Municipal', 'Fagge', 'Nassarawa'],
  Edo: ['Benin City', 'Auchi', 'Ekpoma'],
}

function Navbar() {
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('Nigeria')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const availableCities = state ? locations[state] || [] : []

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand" aria-label="ServeHub home">
        <img src={logo} alt="ServeHub — Local Experts. Real Solutions." />
      </Link>

      <form
        className="navbar-search"
        onSubmit={(event) => {
          event.preventDefault()

          const params = new URLSearchParams()

          if (search.trim()) {
            params.set('q', search.trim())
          }

          if (country) params.set('country', country)
          if (state) params.set('state', state)
          if (city) params.set('city', city)

          window.location.href = `/services?${params.toString()}`
        }}
      >
        <Search size={18} aria-hidden="true" />

        <input
          type="search"
          placeholder="Search for services or professionals..."
          aria-label="Search services"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="location-selectors">
          <MapPin size={16} aria-hidden="true" />

          <select
            aria-label="Country"
            value={country}
            onChange={(event) => {
              setCountry(event.target.value)
              setState('')
              setCity('')
            }}
          >
            <option value="Nigeria">Nigeria</option>
          </select>

          <select
            aria-label="State"
            value={state}
            onChange={(event) => {
              setState(event.target.value)
              setCity('')
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
      </form>

      <nav className={`navbar-actions ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/become-a-member" onClick={() => setMenuOpen(false)}>
          <Handshake size={17} />
          Become a Member
        </NavLink>

        <NavLink to="/login" onClick={() => setMenuOpen(false)}>
          Login
        </NavLink>

        <NavLink
          to="/signup"
          className="signup-btn"
          onClick={() => setMenuOpen(false)}
        >
          Sign Up
        </NavLink>
      </nav>

      <button
        type="button"
        className="menu-toggle"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  )
}

export default Navbar
