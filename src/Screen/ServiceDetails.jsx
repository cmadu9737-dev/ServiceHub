
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import BookingForm from "../Component/BookingForm";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  BriefcaseBusiness,
  CalendarCheck,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import "./ServiceDetails.css";

function ServiceDetails() {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      setError("");

      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (serviceError) {
        setError("This service could not be found or is no longer available.");
        setLoading(false);
        return;
      }

      setService(serviceData);

      const { data: providerData, error: providerError } = await supabase
        .from("profiles")
        .select("id, full_name, business_name, phone, email, location, avatar_url")
        .eq("id", serviceData.provider_id)
        .single();

      if (!providerError) {
        setProvider(providerData);
      }

      setLoading(false);
    };

    fetchServiceDetails();
  }, [id]);

  if (loading) {
    return <main className="service-details-page">
      <p className="service-details-message">Loading service details...</p>
    </main>;
  }

  if (error || !service) {
    return (
      <main className="service-details-page">
        <div className="service-details-container">
          <p className="service-details-error">{error || "Service not found."}</p>
          <Link to="/services" className="service-back-link">
            <ArrowLeft size={18} /> Back to Services
          </Link>
        </div>
      </main>
    );
  }

  const contactNumber = provider?.phone?.replace(/[^\d+]/g, "");
  const whatsappNumber = provider?.phone?.replace(/\D/g, "");

  return (
    <main className="service-details-page">
      <div className="service-details-container">
        <Link to="/services" className="service-back-link">
          <ArrowLeft size={18} /> Back to Services
        </Link>

        <section className="service-details-card">
          <div className="service-details-content">
            <span className="service-details-category">
              {service.category || "Professional Service"}
            </span>

            <h1>{service.title}</h1>

            <p className="service-details-description">
              {service.description || "No description has been provided yet."}
            </p>

            <div className="service-details-info">
              <p>
                <MapPin size={19} />
                {service.location || "Location not provided"}
              </p>

              <p>
                <BriefcaseBusiness size={19} />
                {service.category || "General Service"}
              </p>
            </div>

            <div className="service-details-price">
              <span>Service Price</span>
              <strong>
                {service.price !== null && service.price !== undefined
                  ? `₦${Number(service.price).toLocaleString("en-NG")}`
                  : "Contact provider for price"}
              </strong>
            </div>
          </div>

          <aside className="service-provider-card">
            <h2>About the Provider</h2>

            {provider?.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt="Provider"
                className="service-provider-avatar"
              />
            ) : (
              <div className="service-provider-avatar-placeholder">
                <User size={35} />
              </div>
            )}

            <h3>
              {provider?.business_name ||
                provider?.full_name ||
                "Service Provider"}
            </h3>

            {provider?.full_name && provider?.business_name && (
              <p className="service-provider-name">{provider.full_name}</p>
            )}

            {provider?.location && (
              <p className="service-provider-contact">
                <MapPin size={17} /> {provider.location}
              </p>
            )}

            {provider?.phone && (
              <p className="service-provider-contact">
                <Phone size={17} /> {provider.phone}
              </p>
            )}

            {provider?.email && (
              <p className="service-provider-contact">
                <Mail size={17} /> {provider.email}
              </p>
            )}

            <div className="service-provider-actions">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="service-whatsapp-button"
                >
                  Contact on WhatsApp
                </a>
              )}

              {contactNumber && (
                <a
                  href={`tel:${contactNumber}`}
                  className="service-call-button"
                >
                  <Phone size={17} /> Call Provider
                </a>
              )}

              <BookingForm serviceId={service.id} />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default ServiceDetails;
