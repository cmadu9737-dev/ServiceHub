import "./AboutUs.css";

const stats = [
  { value: "6", label: "Service categories" },
  { value: "36+", label: "States covered" },
  { value: "100%", label: "Local professionals" },
];

const values = [
  { icon: "🛡️", title: "Trust First",
    text: "Every provider on ServeHub is reviewed and rated by real customers, so you always know who you are hiring." },
  { icon: "📍", title: "Truly Local",
    text: "We connect you with experts in your own city and community, because good service starts close to home." },
  { icon: "⚡", title: "Fast & Reliable",
    text: "Search, compare and connect in minutes. No long waits, no endless phone calls." },
  { icon: "🤝", title: "Fair Opportunity",
    text: "We give skilled Nigerians a place to showcase their work, grow their business and get paid for it." },
];

const categories = [
  "Tech & Digital", "Health & Wellness", "Skilled Trades",
  "Agriculture & Farming", "Home Services", "Education & Tutoring",
];

const steps = [
  { n: "1", title: "Search", text: "Tell us the service you need and your location." },
  { n: "2", title: "Compare", text: "Browse profiles, ratings and reviews from local experts." },
  { n: "3", title: "Connect", text: "Reach out directly and get the job done." },
];

export default function AboutUs() {
  return (
    <main className="about">
      <section className="about-hero">
        <div className="about-hero__text">
          <span className="eyebrow">About ServeHub</span>
          <h1>
            Local Experts.<br />
            <span className="accent">Real Solutions.</span>
          </h1>
          <p>
            ServeHub is Nigeria's service marketplace, built to help people find
            trusted professionals for any job, from tech support to home repairs,
            farming to tutoring.
          </p>
          <div className="about-hero__actions">
            <a href="/services" className="btn btn--primary">I need a Service →</a>
            <a href="/become-a-provider" className="btn btn--ghost">Become a Provider</a>
          </div>
        </div>

        <div className="about-hero__stats">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section about-story">
        <div>
          <span className="eyebrow">Our Story</span>
          <h2>Why we built ServeHub</h2>
        </div>
        <div className="about-story__body">
          <p>
            Finding a reliable plumber, a good tutor or a skilled web developer
            in Nigeria often depends on who you know. Too many people lose time
            and money to the wrong hire, and too many talented professionals
            never get seen.
          </p>
          <p>
            ServeHub changes that. We bring customers and service providers
            together in one trusted place, so everyday services are easy to find,
            easy to compare and easy to book.
          </p>
        </div>
      </section>

      <section className="about-section about-mv">
        <article className="card">
          <h3>Our Mission</h3>
          <p>
            To make quality local services accessible to every Nigerian, and to
            help skilled professionals build thriving businesses.
          </p>
        </article>
        <article className="card card--blue">
          <h3>Our Vision</h3>
          <p>
            A Nigeria where anyone can find a trusted expert in minutes, and
            every provider has the chance to be discovered.
          </p>
        </article>
      </section>

      <section className="about-section">
        <span className="eyebrow">What We Stand For</span>
        <h2>Our core values</h2>
        <div className="values-grid">
          {values.map((v) => (
            <article className="card value" key={v.title}>
              <div className="value__icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <span className="eyebrow">How It Works</span>
        <h2>Getting help is simple</h2>
        <div className="steps">
          {steps.map((s) => (
            <div className="step" key={s.n}>
              <span className="step__num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <span className="eyebrow">What You Can Find</span>
        <h2>Services for every need</h2>
        <div className="chips">
          {categories.map((c) => (
            <span className="chip" key={c}>{c}</span>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <h2>Ready to get started?</h2>
        <p>Join ServeHub today and connect with trusted local experts.</p>
        <div className="about-hero__actions">
          <a href="/signup" className="btn btn--white">Get Started</a>
          <a href="/become-a-provider" className="btn btn--outline">Become a Provider</a>
        </div>
      </section>
    </main>
  );
}