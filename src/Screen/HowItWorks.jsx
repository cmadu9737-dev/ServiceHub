import React from "react";
import {
  Search,
  UserRound,
  MessageCircle,
  CheckCircle,
  UserPlus,
  ClipboardList,
  Bell,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Clock,
  Headset,
  ArrowRight,
} from "lucide-react";

import "./HowItWorks.css";

function HowItWorks() {
  const customerSteps = [
    {
      icon: <Search />,
      number: "01",
      title: "Find a Service",
      description:
        "Browse ServeHub to discover the professional services you need.",
    },
    {
      icon: <UserRound />,
      number: "02",
      title: "Choose a Professional",
      description:
        "Explore provider profiles, compare services and choose the right professional.",
    },
    {
      icon: <MessageCircle />,
      number: "03",
      title: "Connect and Book",
      description:
        "Contact your preferred provider, discuss your needs and schedule a service.",
    },
    {
      icon: <CheckCircle />,
      number: "04",
      title: "Get the Job Done",
      description:
        "Enjoy quality service and complete your booking with confidence.",
    },
  ];

  const providerSteps = [
    {
      icon: <UserPlus />,
      title: "Create an Account",
      description:
        "Sign up on ServeHub and start your journey as a service provider.",
    },
    {
      icon: <ClipboardList />,
      title: "Build Your Profile",
      description:
        "Showcase your skills, experience, services and pricing.",
    },
    {
      icon: <Bell />,
      title: "Receive Requests",
      description:
        "Connect with customers looking for the services you provide.",
    },
    {
      icon: <TrendingUp />,
      title: "Grow Your Business",
      description:
        "Build your reputation, attract more customers and grow your business.",
    },
  ];

  const benefits = [
    {
      icon: <ShieldCheck />,
      title: "Trusted Professionals",
      description:
        "Find service providers with profiles that help you make informed decisions.",
    },
    {
      icon: <CreditCard />,
      title: "Convenient Payments",
      description:
        "Enjoy a convenient booking and payment experience.",
    },
    {
      icon: <Clock />,
      title: "Save Time",
      description:
        "Find and connect with professionals without unnecessary stress.",
    },
    {
      icon: <Headset />,
      title: "Easy Communication",
      description:
        "Connect with service providers and discuss your requirements.",
    },
  ];

  return (
    <div className="how-it-works-page">

      {/* HERO SECTION */}
      <section className="how-hero">
        <div className="how-hero-content">
          <span className="how-subtitle">SIMPLE. FAST. RELIABLE.</span>

          <h1>How ServeHub Works</h1>

          <p>
            Finding the right professional for your needs has never
            been easier. ServeHub connects customers with skilled
            service providers in just a few simple steps.
          </p>

          <a href="/services" className="how-primary-btn">
            Explore Services <ArrowRight size={18} />
          </a>
        </div>

        <div className="how-hero-visual">
          <div className="how-visual-card">
            <Search size={45} />
            <h3>Find the right service</h3>
            <p>Everything you need, all in one place.</p>
          </div>
        </div>
      </section>

      {/* CUSTOMER SECTION */}
      <section className="customer-steps">
        <div className="how-section-heading">
          <span className="how-subtitle">FOR CUSTOMERS</span>
          <h2>Get Things Done in 4 Easy Steps</h2>
          <p>
            From finding a service to getting the job completed,
            ServeHub makes the process simple.
          </p>
        </div>

        <div className="how-steps-grid">
          {customerSteps.map((step) => (
            <div className="how-step-card" key={step.number}>
              <div className="how-step-top">
                <div className="how-icon">{step.icon}</div>
                <span>{step.number}</span>
              </div>

              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROVIDER SECTION */}
      <section className="provider-steps">
        <div className="how-section-heading">
          <span className="how-subtitle">FOR SERVICE PROVIDERS</span>
          <h2>Grow Your Business with ServeHub</h2>
          <p>
            Join our platform, showcase your skills and connect
            with customers who need your services.
          </p>
        </div>

        <div className="provider-steps-grid">
          {providerSteps.map((step, index) => (
            <div className="provider-step-card" key={step.title}>
              <div className="how-icon">{step.icon}</div>

              <span>STEP 0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="how-benefits">
        <div className="how-section-heading">
          <span className="how-subtitle">WHY SERVEHUB?</span>
          <h2>A Better Way to Find Services</h2>
          <p>
            We make finding and offering professional services
            easier for everyone.
          </p>
        </div>

        <div className="how-benefits-grid">
          {benefits.map((benefit) => (
            <div className="how-benefit-card" key={benefit.title}>
              <div className="how-icon">{benefit.icon}</div>

              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="how-cta">
        <h2>Ready to Get Started?</h2>

        <p>
          Find the right professional or join ServeHub and start
          growing your service business today.
        </p>

        <a href="/services" className="how-cta-btn">
          Get Started <ArrowRight size={18} />
        </a>
      </section>

    </div>
  );
}

export default HowItWorks;