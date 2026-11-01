import './LandingPageScreen.css'
import playstore from "../assets/plays.png";
import webDeveloperImage from '../assets/tech.jpg';
import {
  Monitor, HeartPulse, Wrench, Sprout, House, GraduationCap,
  ArrowRight, CheckCircle, Star, ShieldCheck, Search, MapPin,
  Mail, Quote, Smartphone, Users, BadgeCheck, CalendarCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Tech & Digital', description: 'Websites, apps, graphic design & more', icon: Monitor },
  { name: 'Health & Wellness', description: 'Doctors, therapy, fitness & wellness', icon: HeartPulse },
  { name: 'Skilled Trades', description: 'Plumbing, electrical, carpentry & more', icon: Wrench },
  { name: 'Agriculture & Farming', description: 'Farming, livestock, agrotech & supplies', icon: Sprout },
  { name: 'Home Services', description: 'Cleaning, repairs, painting & maintenance', icon: House },
  { name: 'Education & Tutoring', description: 'Tutors, courses, language & exam prep', icon: GraduationCap },
]

const services = [
  {
    name: 'Laptop Repair & Software Fix',
    provider: 'TechCare NG',
    category: 'Tech & Digital',
    description: 'Laptop diagnostics, repairs and software support.',
    rating: '4.8',
    reviews: '26',
    price: '₦15,000',
    location: 'Lagos, Lagos',
    image: webDeveloperImage,
  },
  {
     name: 'Medical Test & Health Consultation',
    provider: 'Dr. Amina Yusuf',
    category: 'Health & Wellness',
    description: 'Convenient health consultation and basic testing.',
    rating: '4.9',
    reviews: '89',
    price: '₦10,000',
    location: 'Abuja, FCT',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Home Plumbing Services',
    provider: 'Swift Plumbers',
    category: 'Skilled Trades',
    description: 'Professional plumbing installation and repairs.',
    rating: '4.7',
    reviews: '203',
    price: '₦12,000',
    location: 'Port Harcourt, Rivers',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Poultry Farming Setup & Supplies',
    provider: 'AgroSmart Farms',
    category: 'Agriculture & Farming',
    description: 'Practical poultry setup advice and farm supplies.',
    rating: '4.8',
    reviews: '67',
    price: '₦25,000',
    location: 'Ibadan, Oyo',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'House Cleaning & Deep Clean',
    provider: 'CleanSpace NG',
    category: 'Home Services',
    description: 'Reliable home cleaning for a fresher space.',
    rating: '4.6',
    reviews: '98',
    price: '₦8,000',
    location: 'Kano, Kano',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=85',
  },
  {
   name: 'Mathematics Tutoring (JSS & SS3)',
    provider: 'Excel Tutors',
    category: 'Education & Tutoring',
    description: 'One-to-one mathematics lessons and exam prep.',
    rating: '4.9',
    reviews: '74',
    price: '₦6,000',
    location: 'Benin, Edo',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=85',
  },
]

const steps = [
  { number: '01', title: 'Search', description: 'Find the service you need and browse trusted professionals near you.', icon: Search },
  { number: '02', title: 'Connect', description: 'Message providers, compare offers and choose the best fit.', icon: BadgeCheck },
  { number: '03', title: 'Get it Done', description: 'Book with confidence and get the job done to your satisfaction.', icon: CalendarCheck },
]

// Sample testimonial content and portrait placeholders for the design preview.

const testimonials = [
  {
    quote: 'ServeHub helped me find a reliable plumber the same day. Excellent service and transparent pricing!',
    name: 'Chinedu O.',
    location: 'Lagos, Nigeria',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    quote: 'As a provider, I’ve gotten consistent clients and grown my business. The platform is easy to use.',
    name: 'Funke Adebayo',
    location: 'Ibadan, Nigeria',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    quote: 'Verified professionals, secure payments and real support. ServeHub is a game changer!',
    name: 'Musa Bala',
    location: 'Kano, Nigeria',
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
]

function LandingPageScreen() {
  return (
    <main className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">NIGERIA'S SERVICE MARKETPLACE</span>
          <h1>Find Trusted Local Experts <span>for Any Service</span></h1>
          <p className="hero-description">
            From tech support to home repairs, connect with trusted professionals
            in your community. Fast. Reliable. Local.
          </p>
          <div className="hero-actions">
            <a href="/signup/customer" className="primary-btn">
              I need a Service <ArrowRight size={18} />
            </a>

            <a href="/become-a-member" className="secondary-btn">
              <Users size={17} /> Become a Provider
            </a>
          </div>
          <div className="hero-assurance">
            <span><CheckCircle size={16} /> Trusted professionals</span>
            <span><CheckCircle size={16} /> Local services</span>
          </div>
        </div>

        <div className="hero-collage" aria-label="Examples of professionals on ServeHub">
          <img className="collage-image collage-tech" src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85" alt="Technology professionals collaborating" />
          <img className="collage-image" src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85" alt="Healthcare professionals" />
          <img className="collage-image" src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=85" alt="Skilled technician at work" />
          <img className="collage-image" src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=85" alt="Agriculture and farming" />
          <div className="collage-caption"><ShieldCheck size={20} /><span><strong>Find your expert</strong><small>One place for everyday services</small></span></div>
        </div>
      </section>

      <section className="category-section section-shell">
        <div className="category-grid">
          {categories.map(({ name, description, icon: Icon }) => (
            <a className="category-card" href={`/services?category=${encodeURIComponent(name)}`} key={name}>
              <span className="category-icon"><Icon size={23} /></span>
              <span className="category-copy"><strong>{name}</strong><small>{description}</small></span>
              <ArrowRight className="category-arrow" size={16} />
            </a>
          ))}
        </div>
      </section>
<section className="featured-section section-shell">
        <div className="section-heading section-heading-inline">
          <div><span className="eyebrow">DISCOVER GREAT LOCAL HELP</span><h2>Featured Services</h2></div>
          <a className="text-link" href="/services">View all services <ArrowRight size={16} /></a>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.name}>
              <a className="service-image-link" href={`/services?service=${encodeURIComponent(service.name)}`}>
                <img src={service.image} alt={service.name} loading="lazy" />
                <span className="service-rating"><Star size={13} fill="currentColor" /> {service.rating} <small>({service.reviews})</small></span>
              </a>
              <div className="service-card-content">
                <span className="service-category">{service.category}</span>
                <h3>{service.name}</h3>
                <p className="service-provider">{service.provider}</p>
                <div className="service-meta"><span><MapPin size={13} />{service.location}</span><strong>{service.price}</strong></div>
                <a className="contact-provider" href="/contact"><Mail size={14} /> Contact Provider</a>
              </div>
            </article>
          ))}
        </div>       
      </section>

      <section className="how-section">
        <div className="section-shell">
          <div className="section-heading centered-heading"><span className="eyebrow">A SIMPLE WAY TO GET STARTED</span><h2>How It Works</h2><p>Get your service done in three simple steps.</p></div>
          <div className="steps-grid">
            {steps.map(({ number, title, description, icon: Icon }) => (
              <article className="step-card" key={number}>
                <span className="step-icon"><Icon size={25} /></span><span className="step-number">{number}</span>
                <h3>{title}</h3><p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonial-section section-shell">
        <div className="section-heading section-heading-inline"><div><span className="eyebrow">REAL PEOPLE. REAL EXPERIENCES.</span><h2>What Our Customers Say</h2></div><a className="text-link" href="/reviews">View more reviews <ArrowRight size={16} /></a></div>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article className="testimonial-card" key={item.name}>
              <Quote className="quote-icon" size={23} />
              <p>“{item.quote}”</p>
              <div className="testimonial-person">
                <img
                  src={item.image}
                  alt={`Portrait placeholder for ${item.name}`}
                  className="testimonial-avatar"
                  loading="lazy"
                />
                <span className="testimonial-person-copy">
                  <strong>{item.name}</strong>
                  <small>{item.location}</small>
                </span>
                <span className="testimonial-stars" aria-label="Sample five-star rating">★★★★★</span>
              </div>
            </article>
          ))}
        </div>        
      </section>
 <section className="app-banner section-shell">
        <div className="app-banner-content">
          <span className="eyebrow">SERVEHUB ON THE GO</span>
          <h2>Your Favourite Services, Just a Tap Away.</h2>
          <p>
            Discover trusted professionals, connect with service providers,
            book appointments and manage your services wherever you are.
          </p>
          <div className="app-store-links">
            <a href="#" className="store-badge" aria-label="Google Play availability coming soon">
              <img
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Get it on Google Play"
                loading="lazy"
              />
            </a>
            <a href="#" className="store-badge" aria-label="App Store availability coming soon">
              <img
                src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83"
                alt="Download on the App Store"
                loading="lazy"
              />
            </a>
          </div>
          <small className="app-coming-soon"><CheckCircle size={14} /> App availability will be announced soon</small>
        </div>
        <div className="app-banner-image">
          <img
            src={playstore}
            alt="Person using a smartphone"
            loading="lazy"
          />
          <div className="app-image-caption">
            <Smartphone size={20} />
            <span><strong>ServeHub Mobile</strong><small>Services made simple</small></span>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main section-shell">
          <div className="footer-brand"><a href="/" className="footer-logo"><span className="footer-logo-mark"><CheckCircle size={23} /></span>ServeHub</a><p>Nigeria’s trusted marketplace for local services.</p><div className="social-links"><a href="#" aria-label="Facebook">f</a><a href="#" aria-label="X">𝕏</a><a href="#" aria-label="Instagram">◎</a><a href="#" aria-label="YouTube">▶</a></div></div>
          <div className="footer-column"><h3>Company</h3><Link to ="/about">About Us</Link><a href="/how-it-works">How It Works</a><a href="/careers">Careers</a><a href="/blog">Blog</a></div>
          <div className="footer-column"><h3>For Customers</h3><a href="/services">Find Services</a><a href="/help">Help Center</a><a href="/safety">Safety & Trust</a><a href="/terms">Terms & Conditions</a></div>
          <div className="footer-column"><h3>For Providers</h3><a href="/register">Become a Provider</a><a href="/provider-dashboard">Provider Dashboard</a><a href="/success-tips">Success Tips</a><a href="/provider-support">Provider Support</a></div>
          <div className="footer-column footer-trust"><h3>Trust & Safety</h3><span><ShieldCheck size={17} /> Verified Professionals</span><span><ShieldCheck size={17} /> Secure Payments</span><span><Users size={17} /> Local Experts</span></div>
        </div>
        <div className="footer-bottom section-shell"><span>© {new Date().getFullYear()} ServeHub Nigeria. All rights reserved.</span><div><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a></div></div>
      </footer>
    </main>
  )
}

export default LandingPageScreen
