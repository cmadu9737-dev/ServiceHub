
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapPin, ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { supabase } from "../supabaseClient";
import "./ServicesPage.css";

function ServicesPage() {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError("");

      let query = supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        setServices([]);
      } else {
        setServices(data || []);
      }

      setLoading(false);
    };

    fetchServices();
  }, [selectedCategory]);

  return (
    <main className="services-page">
      <div className="services-container">
        <Link to="/" className="services-back-link">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <header className="services-page-heading">
          <span>DISCOVER SERVEHUB SERVICES</span>
          <h1>{selectedCategory || "All Services"}</h1>
          <p>
            Explore available services and find the right professional
            for your needs.
          </p>
        </header>

        {loading && (
          <p className="services-message">Loading services...</p>
        )}

        {error && (
          <p className="services-error">
            Unable to load services: {error}
          </p>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="services-empty">
            <BriefcaseBusiness size={42} />
            <h2>No services available yet</h2>
            <p>
              There are currently no listed services in this category.
              Please check back later.
            </p>
            <Link to="/" className="services-home-button">
              Explore other categories
            </Link>
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <>
            <p className="services-count">
              {services.length} service{services.length !== 1 ? "s" : ""} found
            </p>

            <div className="services-list-grid">
              {services.map((service) => (
                <article className="services-list-card" key={service.id}>
                  <div className="services-list-card-icon">
                    <BriefcaseBusiness size={25} />
                  </div>

                  <div className="services-list-card-content">
                    <span className="services-list-category">
                      {service.category}
                    </span>

                    <h2>{service.title}</h2>
                    <p>{service.description}</p>

                    <div className="services-list-location">
                      <MapPin size={16} />
                      {service.location || "Location not specified"}
                    </div>

                    <div className="services-list-footer">
                      <strong>
                        ₦{Number(service.price || 0).toLocaleString()}
                      </strong>

                      <Link
                        to={`/service/${service.id}`}
                        className="services-view-button"
                      >
                        View Service
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default ServicesPage;
