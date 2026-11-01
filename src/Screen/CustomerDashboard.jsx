import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  LayoutDashboard,
  CalendarDays,
  MessageCircle,
  Search,
  User,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Pencil,
  Camera,
  Save,
  X,
  BriefcaseBusiness,
  Send,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import "./CustomerDashboard.css";

const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "My bookings", icon: CalendarDays },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "services", label: "Browse services", icon: Search },
  { id: "profile", label: "My profile", icon: User },
];

const statuses = [
  "pending",
  "accepted",
  "rejected",
  "in_progress",
  "completed",
  "cancelled",
];

const emptyForm = {
  full_name: "",
  phone: "",
  location: "",
};

function formatDate(value) {
  if (!value) return "Date unavailable";

  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatPrice(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function statusLabel(status) {
  return String(status || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function CustomerDashboard() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyForm);

  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [activeSection, setActiveSection] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [chatText, setChatText] = useState("");
  const [bookingDate, setBookingDate] = useState("");

  const [editing, setEditing] = useState(false);
  const [pictureFile, setPictureFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4000);
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select(
            "id, full_name, email, phone, location, role, avatar_url"
          )
          .eq("id", user.id)
          .single();

      if (profileError) throw profileError;

      if (profile.role !== "customer") {
        navigate(
          profile.role === "provider"
            ? "/provider-dashboard"
            : "/login"
        );
        return;
      }

      setCustomer(profile);

      setProfileForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        location: profile.location || "",
      });

      const [
        { data: serviceRows, error: serviceError },
        { data: bookingRows, error: bookingError },
      ] = await Promise.all([
        supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),

        supabase
          .from("bookings")
          .select(`
            id,
            customer_id,
            service_id,
            booking_date,
            status
          `)
          .eq("customer_id", user.id)
          .order("booking_date", { ascending: false }),
      ]);

      if (serviceError) throw serviceError;
      if (bookingError) throw bookingError;

      const providerIds = [
        ...new Set(
          (serviceRows || [])
            .map((service) => service.provider_id)
            .filter(Boolean)
        ),
      ];

      let providerStatuses = {};

      if (providerIds.length > 0) {
        const { data: providerRows, error: providerError } =
          await supabase.rpc("get_provider_online_status", {
            provider_ids: providerIds,
          });

        if (providerError) {
          console.warn("Provider status unavailable:", providerError);
        } else {
          providerStatuses = Object.fromEntries(
            (providerRows || []).map((provider) => [
              provider.id,
              provider.is_online === true,
            ])
          );
        }
      }

      const servicesWithStatus = (serviceRows || []).map(
        (service) => ({
          ...service,
          provider_is_online:
            providerStatuses[service.provider_id] === true,
        })
      );

      const serviceIds = [
        ...new Set(
          (bookingRows || [])
            .map((booking) => booking.service_id)
            .filter(Boolean)
        ),
      ];

      let bookingServices = [];

      if (serviceIds.length > 0) {
        const { data, error: bookingServicesError } =
          await supabase
            .from("services")
            .select("id, title, category, price, location, provider_id")
            .in("id", serviceIds);

        if (bookingServicesError) throw bookingServicesError;

        bookingServices = data || [];
      }

      const bookingProviderIds = [
        ...new Set(
          bookingServices
            .map((service) => service.provider_id)
            .filter(Boolean)
        ),
      ];

      let providerProfiles = [];

      if (bookingProviderIds.length > 0) {
        const { data, error: providerProfilesError } =
          await supabase
            .from("profiles")
            .select("id, full_name, business_name, phone, avatar_url")
            .in("id", bookingProviderIds);

        if (providerProfilesError) throw providerProfilesError;

        providerProfiles = data || [];
      }

      const enrichedBookings = (bookingRows || []).map(
        (booking) => {
          const service = bookingServices.find(
            (item) => item.id === booking.service_id
          );

          const provider = providerProfiles.find(
            (item) => item.id === service?.provider_id
          );

          return {
            ...booking,
            services: service || null,
            provider: provider || null,
          };
        }
      );

      setServices(servicesWithStatus);
      setBookings(enrichedBookings);

      setSelectedBooking((current) => {
        if (!current) return null;

        return (
          enrichedBookings.find(
            (booking) => booking.id === current.id
          ) || null
        );
      });
    } catch (err) {
      console.error("Customer dashboard error:", err);
      setError(err.message || "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // LOAD MESSAGES FOR THE SELECTED BOOKING
  const fetchMessages = useCallback(async () => {
    console.log("CUSTOMER BOOKING ID:", selectedBooking?.id);

    if (!selectedBooking?.id) {
      setMessages([]);
      return;
    }

    const { data, error: messageError } = await supabase
      .from("booking_messages")
      .select("*")
      .eq("booking_id", selectedBooking.id)
      .order("created_at", { ascending: true });

    if (messageError) {
      console.error("Message loading error:", messageError);
      setError(messageError.message || "Could not load this conversation.");
      return;
    }

    console.log("CUSTOMER MESSAGES RECEIVED:", data);

    setMessages(data || []);
  }, [selectedBooking?.id]);

  useEffect(() => {
    fetchMessages();

    if (!selectedBooking?.id) return;

    const channel = supabase
      .channel(`customer-chat-${selectedBooking.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking_messages",
          filter: `booking_id=eq.${selectedBooking.id}`,
        },
        fetchMessages
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedBooking?.id, fetchMessages]);

  // SEND A CUSTOMER MESSAGE
  const sendMessage = async (event) => {
    event.preventDefault();

    if (!chatText.trim() || !selectedBooking || !customer) return;

    setSendingMessage(true);
    setError("");

    try {
      const messageText = chatText.trim();

      const { data, error: sendError } = await supabase
        .from("booking_messages")
        .insert({
          booking_id: selectedBooking.id,
          sender_id: customer.id,
          message: messageText,
        })
        .select()
        .single();

      if (sendError) throw sendError;

      setMessages((current) => {
        if (current.some((message) => message.id === data.id)) {
          return current;
        }

        return [...current, data];
      });

      setChatText("");

      console.log("CUSTOMER MESSAGE SENT:", data);
    } catch (err) {
      console.error("Customer send message error:", err);
      setError(err.message || "Message could not be sent.");
    } finally {
      setSendingMessage(false);
    }
  };

  const bookService = async (service) => {
    if (!customer) return;

    if (!bookingDate) {
      setError("Please select a preferred booking date and time.");
      return;
    }

    const selectedDate = new Date(bookingDate);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate <= new Date()
    ) {
      setError("Please choose a future booking date and time.");
      return;
    }

    setBookingLoading(true);
    setError("");

    try {
      const { data, error: insertError } = await supabase
        .from("bookings")
        .insert({
          customer_id: customer.id,
          service_id: service.id,
          booking_date: selectedDate.toISOString(),
          status: "pending",
        })
        .select(`
          id,
          customer_id,
          service_id,
          booking_date,
          status
        `)
        .single();

      if (insertError) throw insertError;

      const newBooking = {
        ...data,
        services: service,
        provider: null,
      };

      setBookings((current) => [newBooking, ...current]);
      setSelectedBooking(newBooking);
      setBookingDate("");
      setActiveSection("bookings");

      showNotice("Your booking request has been sent!");
    } catch (err) {
      setError(err.message || "Could not create your booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelBooking = async (booking) => {
    if (!customer || booking.status !== "pending") return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking request?"
    );

    if (!confirmed) return;

    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", booking.id)
        .eq("customer_id", customer.id)
        .eq("status", "pending");

      if (updateError) throw updateError;

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id
            ? { ...item, status: "cancelled" }
            : item
        )
      );

      setSelectedBooking((current) =>
        current?.id === booking.id
          ? { ...current, status: "cancelled" }
          : current
      );

      showNotice("Booking cancelled.");
    } catch (err) {
      setError(err.message || "Could not cancel booking.");
    }
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Your picture must be smaller than 2MB.");
      return;
    }

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setPictureFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (!customer) return;

    setSaving(true);
    setError("");

    try {
      let avatarUrl = customer.avatar_url || null;

      if (pictureFile) {
        const extension = pictureFile.name.split(".").pop().toLowerCase();
        const path = `${customer.id}/customer-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-pictures")
          .upload(path, pictureFile, {
            upsert: false,
            contentType: pictureFile.type,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("profile-pictures")
          .getPublicUrl(path);

        avatarUrl = data.publicUrl;
      }

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name.trim(),
          phone: profileForm.phone.trim(),
          location: profileForm.location.trim(),
          avatar_url: avatarUrl,
        })
        .eq("id", customer.id)
        .select(
          "id, full_name, email, phone, location, role, avatar_url"
        )
        .single();

      if (updateError) throw updateError;

      setCustomer(data);
      setPictureFile(null);

      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }

      setPreview("");
      setEditing(false);
      showNotice("Your profile has been updated.");
    } catch (err) {
      setError(err.message || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setProfileForm({
      full_name: customer?.full_name || "",
      phone: customer?.phone || "",
      location: customer?.location || "",
    });

    setPictureFile(null);

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setPreview("");
    setEditing(false);
    setError("");
  };

  const logout = async () => {
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    navigate("/login");
  };

  const filteredServices = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return services.filter((service) =>
      `${service.title || ""} ${service.category || ""} ${
        service.location || ""
      }`
        .toLowerCase()
        .includes(term)
    );
  }, [services, searchTerm]);

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const acceptedCount = bookings.filter(
    (booking) =>
      booking.status === "accepted" ||
      booking.status === "in_progress"
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  const rejectedCount = bookings.filter(
    (booking) =>
      booking.status === "rejected" ||
      booking.status === "cancelled"
  ).length;

  const openChat = (booking) => {
    setSelectedBooking(booking);
    setActiveSection("messages");
  };

  if (loading) {
    return (
      <div className="customer-loading">
        <div className="customer-loader" />
        <p>Loading your ServeHub dashboard...</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="customer-dashboard">
      <aside className="customer-sidebar">
        <div className="customer-brand">
          <div className="customer-brand-icon">S</div>
          <div>
            <strong>ServeHub</strong>
            <span>Customer workspace</span>
          </div>
        </div>

        <div className="customer-sidebar-profile">
          <img
            src={
              customer.avatar_url ||
              "https://placehold.co/100x100?text=Profile"
            }
            alt="Customer"
          />
          <div>
            <strong>{customer.full_name || "Customer"}</strong>
            <span>Customer account</span>
          </div>
        </div>

        <nav className="customer-navigation">
          <span className="customer-nav-label">WORKSPACE</span>

          {sections.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={
                activeSection === id
                  ? "customer-nav-link active"
                  : "customer-nav-link"
              }
              onClick={() => setActiveSection(id)}
            >
              <Icon size={19} />
              <span>{label}</span>

              {id === "bookings" && pendingCount > 0 && (
                <span className="customer-nav-count">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="customer-sidebar-bottom">
          <button
            type="button"
            className="customer-nav-link"
            onClick={logout}
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="customer-main">
        <header className="customer-topbar">
          <div>
            <span className="customer-eyebrow">YOUR WORKSPACE</span>
            <h1>
              {sections.find((section) => section.id === activeSection)?.label}
            </h1>
          </div>

          <button
            type="button"
            className="customer-avatar-button"
            onClick={() => setActiveSection("profile")}
          >
            <img
              src={
                customer.avatar_url ||
                "https://placehold.co/100x100?text=Profile"
              }
              alt="Profile"
            />
          </button>
        </header>

        {notice && (
          <div className="customer-notice">{notice}</div>
        )}

        {error && (
          <div className="customer-error">
            {error}
            <button type="button" onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* OVERVIEW */}
        {activeSection === "overview" && (
          <section className="customer-content">
            <div className="customer-welcome-card">
              <div>
                <span className="customer-eyebrow">
                  CUSTOMER OVERVIEW
                </span>
                <h2>
                  Welcome back, {customer.full_name || "Customer"}!
                </h2>
                <p>
                  Find trusted professionals, manage your bookings,
                  and stay connected with your providers.
                </p>
                <button
                  type="button"
                  className="customer-primary-button"
                  onClick={() => setActiveSection("services")}
                >
                  Explore services <ArrowRight size={17} />
                </button>
              </div>
            </div>

            <div className="customer-stats-grid">
              <div className="customer-stat-card">
                <span>Total bookings</span>
                <strong>{bookings.length}</strong>
                <small>All your requests</small>
              </div>

              <div className="customer-stat-card">
                <span>Pending</span>
                <strong>{pendingCount}</strong>
                <small>Awaiting provider response</small>
              </div>

              <div className="customer-stat-card">
                <span>Accepted / Active</span>
                <strong>{acceptedCount}</strong>
                <small>Being handled by providers</small>
              </div>

              <div className="customer-stat-card">
                <span>Completed</span>
                <strong>{completedCount}</strong>
                <small>Finished services</small>
              </div>
            </div>

            <div className="customer-overview-grid">
              <div className="customer-panel">
                <div className="customer-panel-heading">
                  <div>
                    <h2>Recent bookings</h2>
                    <p>Your latest service requests</p>
                  </div>
                  <button
                    type="button"
                    className="customer-text-button"
                    onClick={() => setActiveSection("bookings")}
                  >
                    View all
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div className="customer-empty-state">
                    <CalendarDays size={34} />
                    <h3>No bookings yet</h3>
                    <p>Book a service to see it here.</p>
                  </div>
                ) : (
                  <div className="customer-booking-list">
                    {bookings.slice(0, 5).map((booking) => (
                      <div
                        className="customer-booking-row"
                        key={booking.id}
                      >
                        <div>
                          <strong>
                            {booking.services?.title || "Service"}
                          </strong>
                          <small>
                            {formatDate(booking.booking_date)}
                          </small>
                        </div>
                        <span
                          className={`customer-status ${booking.status}`}
                        >
                          {statusLabel(booking.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="customer-panel">
                <div className="customer-panel-heading">
                  <div>
                    <h2>Quick actions</h2>
                    <p>Manage your account</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="customer-quick-action"
                  onClick={() => setActiveSection("services")}
                >
                  <Search size={19} />
                  Browse services
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  className="customer-quick-action"
                  onClick={() => setActiveSection("bookings")}
                >
                  <CalendarDays size={19} />
                  Track my bookings
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  className="customer-quick-action"
                  onClick={() => setActiveSection("messages")}
                >
                  <MessageCircle size={19} />
                  Chat with providers
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  className="customer-quick-action"
                  onClick={() => setActiveSection("profile")}
                >
                  <User size={19} />
                  Edit my profile
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* BOOKINGS */}
        {activeSection === "bookings" && (
          <section className="customer-content">
            <div className="customer-section-heading">
              <div>
                <h2>My bookings</h2>
                <p>Follow the progress of your service requests.</p>
              </div>

              <button
                type="button"
                className="customer-secondary-button"
                onClick={fetchDashboardData}
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="customer-empty-state large">
                <CalendarDays size={42} />
                <h3>No bookings found</h3>
                <p>Your bookings will appear here after you request a service.</p>
                <button
                  type="button"
                  className="customer-primary-button"
                  onClick={() => setActiveSection("services")}
                >
                  Browse services
                </button>
              </div>
            ) : (
              <div className="customer-booking-cards">
                {bookings.map((booking) => (
                  <article
                    className="customer-booking-card"
                    key={booking.id}
                  >
                    <div className="customer-booking-card-heading">
                      <div>
                        <span className="customer-eyebrow">
                          BOOKING REQUEST
                        </span>
                        <h3>
                          {booking.services?.title || "Selected service"}
                        </h3>
                      </div>
                      <span
                        className={`customer-status ${booking.status}`}
                      >
                        {statusLabel(booking.status)}
                      </span>
                    </div>

                    <div className="customer-booking-information">
                      <div>
                        <CalendarDays size={18} />
                        <span>{formatDate(booking.booking_date)}</span>
                      </div>
                      <div>
                        <User size={18} />
                        <span>
                          {booking.provider?.business_name ||
                            booking.provider?.full_name ||
                            "Provider"}
                        </span>
                      </div>
                      <div>
                        <MapPin size={18} />
                        <span>
                          {booking.services?.location ||
                            "Location not specified"}
                        </span>
                      </div>
                      {booking.services?.price != null && (
                        <div>
                          <BriefcaseBusiness size={18} />
                          <span>
                            {formatPrice(booking.services.price)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="customer-progress">
                      {["pending", "accepted", "in_progress", "completed"].map(
                        (step, index) => {
                          const active =
                            statuses.indexOf(booking.status) >= 0 &&
                            (
                              booking.status === "rejected" ||
                              booking.status === "cancelled"
                                ? false
                                : statuses.indexOf(booking.status) >= 0 &&
                                  ["pending", "accepted", "in_progress", "completed"].indexOf(booking.status) >= index
                            );

                          return (
                            <div
                              key={step}
                              className={
                                active
                                  ? "customer-progress-step active"
                                  : "customer-progress-step"
                              }
                            >
                              <span>{index + 1}</span>
                              <small>{statusLabel(step)}</small>
                            </div>
                          );
                        }
                      )}
                    </div>

                    {(booking.status === "rejected" ||
                      booking.status === "cancelled") && (
                      <p className="customer-booking-warning">
                        {booking.status === "rejected"
                          ? "The provider declined this request."
                          : "This booking has been cancelled."}
                      </p>
                    )}

                    <div className="customer-card-actions">
                      <button
                        type="button"
                        className="customer-primary-button"
                        onClick={() => openChat(booking)}
                      >
                        <MessageCircle size={16} />
                        Chat with provider
                      </button>

                      {booking.provider?.phone && (
                        <a
                          className="customer-secondary-button"
                          href={`tel:${booking.provider.phone}`}
                        >
                          <Phone size={16} /> Call provider
                        </a>
                      )}

                      {booking.status === "pending" && (
                        <button
                          type="button"
                          className="customer-danger-button"
                          onClick={() => cancelBooking(booking)}
                        >
                          Cancel request
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* MESSAGES */}
        {activeSection === "messages" && (
          <section className="customer-content">
            <div className="customer-section-heading">
              <div>
                <h2>Messages</h2>
                <p>Chat with providers about your bookings.</p>
              </div>
            </div>

            <div className="customer-chat-layout">
              <div className="customer-chat-bookings">
                <h3>Your providers</h3>

                {bookings.length === 0 ? (
                  <p className="customer-muted">
                    Your provider conversations will appear here after booking.
                  </p>
                ) : (
                  bookings.map((booking) => (
                    <button
                      type="button"
                      key={booking.id}
                      className={
                        selectedBooking?.id === booking.id
                          ? "customer-chat-contact active"
                          : "customer-chat-contact"
                      }
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <span className="customer-chat-avatar">
                        {(booking.provider?.business_name ||
                          booking.provider?.full_name ||
                          "P").charAt(0).toUpperCase()}
                      </span>
                      <span>
                        <strong>
                          {booking.provider?.business_name ||
                            booking.provider?.full_name ||
                            "Provider"}
                        </strong>
                        <small>
                          {booking.services?.title || "Service booking"}
                        </small>
                      </span>
                    </button>
                  ))
                )}
              </div>

              <div className="customer-chat-window">
                {selectedBooking ? (
                  <>
                    <div className="customer-chat-header">
                      <div>
                        <h3>
                          {selectedBooking.provider?.business_name ||
                            selectedBooking.provider?.full_name ||
                            "Provider"}
                        </h3>
                        <p>
                          {selectedBooking.services?.title ||
                            "Service booking"}
                        </p>
                      </div>

                      {selectedBooking.provider?.phone && (
                        <a
                          className="customer-secondary-button"
                          href={`tel:${selectedBooking.provider.phone}`}
                        >
                          <Phone size={16} /> Call
                        </a>
                      )}
                    </div>

                    <div className="customer-chat-messages">
                      {messages.length === 0 ? (
                        <div className="customer-empty-state">
                          <MessageCircle size={36} />
                          <h3>Start a conversation</h3>
                          <p>Send a message to your service provider.</p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const mine =
                            message.sender_id === customer.id;

                          return (
                            <div
                              key={message.id}
                              className={
                                mine
                                  ? "customer-message mine"
                                  : "customer-message"
                              }
                            >
                              <p>{message.message}</p>
                              <small>
                                {new Date(
                                  message.created_at
                                ).toLocaleString("en-NG")}
                              </small>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <form
                      className="customer-chat-form"
                      onSubmit={sendMessage}
                    >
                      <input
                        value={chatText}
                        onChange={(event) =>
                          setChatText(event.target.value)
                        }
                        placeholder="Write a message..."
                        aria-label="Write a message"
                      />
                      <button
                        type="submit"
                        className="customer-primary-button"
                        disabled={
                          sendingMessage || !chatText.trim()
                        }
                      >
                        <Send size={17} />
                        {sendingMessage ? "Sending..." : "Send"}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="customer-empty-state">
                    <MessageCircle size={40} />
                    <h3>Select a conversation</h3>
                    <p>Choose a booking on the left to chat with its provider.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* BROWSE SERVICES */}
        {activeSection === "services" && (
          <section className="customer-content">
            <div className="customer-section-heading">
              <div>
                <h2>Browse services</h2>
                <p>Find a service provider that meets your needs.</p>
              </div>
            </div>

            <div className="customer-search">
              <Search size={19} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search services, categories, or locations..."
              />
            </div>

            <div className="customer-services-heading">
              <h3>Available services</h3>
              <span>{filteredServices.length} services</span>
            </div>

            {filteredServices.length === 0 ? (
              <div className="customer-empty-state large">
                <BriefcaseBusiness size={42} />
                <h3>No services found</h3>
                <p>
                  {searchTerm
                    ? "Try a different search."
                    : "There are no active services available right now."}
                </p>
              </div>
            ) : (
              <div className="customer-services-grid">
                {filteredServices.map((service) => (
                  <article
                    className="customer-service-card"
                    key={service.id}
                  >
                    {service.image_url ? (
                      <img
                        className="customer-service-image"
                        src={service.image_url}
                        alt={service.title}
                      />
                    ) : (
                      <div className="customer-service-image-placeholder">
                        <BriefcaseBusiness size={38} />
                      </div>
                    )}

                    <div className="customer-service-body">
                      <div className="customer-service-card-top">
                        <span className="customer-category">
                          {service.category || "General"}
                        </span>
                        <span
                          className={
                            service.provider_is_online
                              ? "customer-online online"
                              : "customer-online offline"
                          }
                        >
                          <span />
                          {service.provider_is_online
                            ? "Online"
                            : "Offline"}
                        </span>
                      </div>

                      <h3>{service.title}</h3>
                      <p className="customer-service-description">
                        {service.description ||
                          "No description provided."}
                      </p>

                      <div className="customer-service-location">
                        <MapPin size={16} />
                        {service.location || "Location not specified"}
                      </div>

                      <strong className="customer-service-price">
                        {service.price != null
                          ? formatPrice(service.price)
                          : "Price not listed"}
                      </strong>

                      <label className="customer-date-label">
                        Preferred booking date and time
                        <input
                          type="datetime-local"
                          value={bookingDate}
                          min={new Date(Date.now() + 60000)
                            .toISOString()
                            .slice(0, 16)}
                          onChange={(event) =>
                            setBookingDate(event.target.value)
                          }
                        />
                      </label>

                      <button
                        type="button"
                        className="customer-primary-button customer-book-button"
                        onClick={() => bookService(service)}
                        disabled={bookingLoading}
                      >
                        {bookingLoading
                          ? "Sending request..."
                          : "Book this service"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* PROFILE */}
        {activeSection === "profile" && (
          <section className="customer-content">
            <div className="customer-section-heading">
              <div>
                <h2>My profile</h2>
                <p>Manage your personal information.</p>
              </div>
            </div>

            <div className="customer-panel customer-profile-panel">
              <div className="customer-profile-heading">
                <h2>Personal information</h2>
                {!editing && (
                  <button
                    type="button"
                    className="customer-primary-button"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil size={16} /> Edit profile
                  </button>
                )}
              </div>

              {editing ? (
                <form className="customer-profile-form" onSubmit={saveProfile}>
                  <div className="customer-profile-picture">
                    <img
                      src={
                        preview ||
                        customer.avatar_url ||
                        "https://placehold.co/120x120?text=Photo"
                      }
                      alt="Profile preview"
                    />
                    <label className="customer-secondary-button">
                      <Camera size={16} /> Change picture
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePictureChange}
                        hidden
                      />
                    </label>
                  </div>

                  <label>
                    Full name
                    <input
                      required
                      value={profileForm.full_name}
                      onChange={(event) =>
                        setProfileForm({
                          ...profileForm,
                          full_name: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Phone number
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(event) =>
                        setProfileForm({
                          ...profileForm,
                          phone: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Location
                    <input
                      value={profileForm.location}
                      onChange={(event) =>
                        setProfileForm({
                          ...profileForm,
                          location: event.target.value,
                        })
                      }
                    />
                  </label>

                  <div className="customer-profile-actions">
                    <button
                      type="submit"
                      className="customer-primary-button"
                      disabled={saving}
                    >
                      <Save size={16} />
                      {saving ? "Saving..." : "Save changes"}
                    </button>

                    <button
                      type="button"
                      className="customer-secondary-button"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="customer-profile-picture">
                    <img
                      src={
                        customer.avatar_url ||
                        "https://placehold.co/120x120?text=Photo"
                      }
                      alt="Customer"
                    />
                  </div>

                  <div className="customer-profile-details">
                    <div>
                      <User size={19} />
                      <span>
                        Full name
                        <strong>{customer.full_name || "Not provided"}</strong>
                      </span>
                    </div>
                    <div>
                      <Mail size={19} />
                      <span>
                        Email
                        <strong>{customer.email || "Not provided"}</strong>
                      </span>
                    </div>
                    <div>
                      <Phone size={19} />
                      <span>
                        Phone
                        <strong>{customer.phone || "Not provided"}</strong>
                      </span>
                    </div>
                    <div>
                      <MapPin size={19} />
                      <span>
                        Location
                        <strong>{customer.location || "Not provided"}</strong>
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default CustomerDashboard;