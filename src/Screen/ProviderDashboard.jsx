
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./ProviderDashboard.css";

const emptyProfile = {
  full_name: "",
  business_name: "",
  phone: "",
  location: "",
};

const emptyService = {
  title: "",
  description: "",
  category: "",
  price: "",
  location: "",
};

const serviceCategories = [
  "Tech & Digital",
  "Health & Wellness",
  "Skilled Trades",
  "Agriculture & Farming",
  "Home Services",
  "Education & Tutoring",
  "Other",
];

const sections = [
  { id: "overview", label: "Overview", icon: "▦" },
  { id: "bookings", label: "Bookings", icon: "▤" },
  { id: "messages", label: "Customer chat", icon: "▣" },
  { id: "services", label: "My services", icon: "◇" },
  { id: "portfolio", label: "Portfolio", icon: "▧" },
  { id: "profile", label: "My profile", icon: "◎" },
  { id: "availability", label: "Availability", icon: "◷" },
];

function formatDate(value) {
  if (!value) return "Date unavailable";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function getPhoneLink(phone) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

export default function ProviderDashboard() {
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [serviceForm, setServiceForm] = useState(emptyService);
  const [editingService, setEditingService] = useState(null);
  const [customCategory, setCustomCategory] = useState("");

  const [serviceImageFile, setServiceImageFile] = useState(null);
  const [serviceImagePreview, setServiceImagePreview] = useState("");
  const [uploadingServiceImage, setUploadingServiceImage] = useState(false);

  const [activeSection, setActiveSection] = useState("overview");

  // Active services are shown first when My Services is opened.
  const [serviceFilter, setServiceFilter] = useState("active");

  const [chatText, setChatText] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState(null);
  const [updatingServiceId, setUpdatingServiceId] = useState(null);

  const [notice, setNotice] = useState({
    type: "",
    text: "",
  });

  const showNotice = (text, type = "success") => {
    setNotice({ text, type });

    window.setTimeout(() => {
      setNotice({ text: "", type: "" });
    }, 4500);
  };

  const clearServiceImage = () => {
    if (serviceImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(serviceImagePreview);
    }

    setServiceImageFile(null);
    setServiceImagePreview("");
  };

  const handleServiceImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showNotice("Choose a JPG, PNG, or WebP image.", "error");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotice("Service images must be smaller than 5MB.", "error");
      event.target.value = "";
      return;
    }

    if (serviceImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(serviceImagePreview);
    }

    setServiceImageFile(file);
    setServiceImagePreview(URL.createObjectURL(file));
  };

  const fetchProviderData = useCallback(async () => {
    setLoading(true);

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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, phone, location, business_name, avatar_url, role, is_online"
        )
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== "provider") {
        navigate("/customer-dashboard");
        return;
      }

      setProvider(profile);

      setProfileForm({
        full_name: profile.full_name || "",
        business_name: profile.business_name || "",
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
          .eq("provider_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("bookings")
          .select(`
            *,
            services!inner (
              id,
              title,
              provider_id,
              price
            )
          `)
          .eq("services.provider_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (serviceError) throw serviceError;
      if (bookingError) throw bookingError;

      setServices(serviceRows || []);
      setBookings(bookingRows || []);
    } catch (error) {
      console.error("Dashboard loading error:", error);

      showNotice(
        error.message || "Could not load your dashboard.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProviderData();
  }, [fetchProviderData]);

  const fetchMessages = useCallback(async () => {
    if (!selectedBooking?.id) {
      setMessages([]);
      return;
    }

    const { data, error } = await supabase
      .from("booking_messages")
      .select("*")
      .eq("booking_id", selectedBooking.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Message loading error:", error);
      showNotice("Could not load this conversation.", "error");
      return;
    }

    setMessages(data || []);
  }, [selectedBooking?.id]);

  useEffect(() => {
    fetchMessages();

    if (!selectedBooking?.id) return;

    const channel = supabase
      .channel(`booking-messages-${selectedBooking.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking_messages",
          filter: `booking_id=eq.${selectedBooking.id}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedBooking?.id, fetchMessages]);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!chatText.trim() || !selectedBooking || !provider) return;

    setSendingMessage(true);

    try {
      const { error } = await supabase
        .from("booking_messages")
        .insert({
          booking_id: selectedBooking.id,
          sender_id: provider.id,
          message: chatText.trim(),
        });

      if (error) throw error;

      setChatText("");
      await fetchMessages();
    } catch (error) {
      console.error("Message sending error:", error);

      showNotice(
        error.message || "Message could not be sent.",
        "error"
      );
    } finally {
      setSendingMessage(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status }
            : booking
        )
      );

      showNotice(`Booking ${status} successfully.`);
    } catch (error) {
      showNotice(
        error.message || "Could not update booking.",
        "error"
      );
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (!provider) return;

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name.trim(),
          business_name: profileForm.business_name.trim(),
          phone: profileForm.phone.trim(),
          location: profileForm.location.trim(),
        })
        .eq("id", provider.id)
        .select()
        .single();

      if (error) throw error;

      setProvider((current) => ({ ...current, ...data }));
      showNotice("Your profile has been updated.");
    } catch (error) {
      showNotice(
        error.message || "Profile update failed.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !provider) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showNotice("Choose a JPG, PNG, or WebP image.", "error");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotice("Your image must be smaller than 2MB.", "error");
      event.target.value = "";
      return;
    }

    setUploadingAvatar(true);

    try {
      const extension = file.name.split(".").pop();
      const filePath = `${provider.id}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: imageData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);

      const avatarUrl = imageData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", provider.id);

      if (updateError) throw updateError;

      setProvider((current) => ({
        ...current,
        avatar_url: avatarUrl,
      }));

      showNotice("Profile picture updated.");
    } catch (error) {
      showNotice(
        error.message || "Image upload failed.",
        "error"
      );
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const toggleOnlineStatus = async () => {
    if (!provider) return;

    const nextStatus = !provider.is_online;

    const { error } = await supabase
      .from("profiles")
      .update({ is_online: nextStatus })
      .eq("id", provider.id);

    if (error) {
      showNotice(
        error.message || "Could not update availability.",
        "error"
      );
      return;
    }

    setProvider((current) => ({
      ...current,
      is_online: nextStatus,
    }));

    showNotice(
      nextStatus ? "You are now online." : "You are now offline."
    );
  };

  const uploadServiceImage = async () => {
    if (!serviceImageFile || !provider) return null;

    const safeFileName = serviceImageFile.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "-"
    );

    const filePath = `${provider.id}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("service-images")
      .upload(filePath, serviceImageFile, {
        upsert: false,
        contentType: serviceImageFile.type,
      });

    if (uploadError) throw uploadError;

    const { data: imageData } = supabase.storage
      .from("service-images")
      .getPublicUrl(filePath);

    if (!imageData?.publicUrl) {
      throw new Error("Could not get the uploaded image URL.");
    }

    return imageData.publicUrl;
  };

  const saveService = async (event) => {
    event.preventDefault();

    if (!provider) return;

    const finalCategory =
      serviceForm.category === "Other"
        ? customCategory.trim()
        : serviceForm.category.trim();

    if (!finalCategory) {
      showNotice(
        "Please select or enter a service category.",
        "error"
      );
      return;
    }

    setSaving(true);

    try {
      let imageUrl = editingService?.image_url || null;

      if (serviceImageFile) {
        setUploadingServiceImage(true);
        imageUrl = await uploadServiceImage();
      }

      const payload = {
        title: serviceForm.title.trim(),
        description: serviceForm.description.trim(),
        category: finalCategory,
        price: Number(serviceForm.price),
        location: serviceForm.location.trim(),
        provider_id: provider.id,
        image_url: imageUrl,
      };

      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editingService.id)
          .eq("provider_id", provider.id);

        if (error) throw error;

        showNotice("Service updated successfully.");
      } else {
        const { error } = await supabase
          .from("services")
          .insert({
            ...payload,
            is_active: true,
          });

        if (error) throw error;

        showNotice("Service added successfully.");
      }

      setServiceForm(emptyService);
      setEditingService(null);
      setCustomCategory("");
      clearServiceImage();

      await fetchProviderData();
    } catch (error) {
      console.error("Service saving error:", error);

      showNotice(
        error.message || "Could not save service.",
        "error"
      );
    } finally {
      setSaving(false);
      setUploadingServiceImage(false);
    }
  };

  const startEditingService = (service) => {
    const knownCategory = serviceCategories
      .slice(0, 6)
      .includes(service.category);

    const isCustomCategory =
      Boolean(service.category) && !knownCategory;

    clearServiceImage();

    setEditingService(service);
    setCustomCategory(isCustomCategory ? service.category : "");

    setServiceForm({
      title: service.title || "",
      description: service.description || "",
      category: isCustomCategory
        ? "Other"
        : service.category || "",
      price: service.price ?? "",
      location: service.location || "",
    });

    setServiceImagePreview(service.image_url || "");

    setActiveSection("services");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetServiceForm = () => {
    clearServiceImage();
    setEditingService(null);
    setServiceForm(emptyService);
    setCustomCategory("");
  };

  // ARCHIVE OR RESTORE A SERVICE.
  // Updates only is_active and preserves the service and its bookings.
  const toggleServiceArchive = async (service) => {
    if (!provider || updatingServiceId || deletingServiceId) return;

    const nextStatus = service.is_active === false;

    const confirmed = window.confirm(
      nextStatus
        ? `Restore "${service.title}"? Customers will be able to find it again.`
        : `Archive "${service.title}"? Customers will no longer see it, but its booking history will be preserved.`
    );

    if (!confirmed) return;

    setUpdatingServiceId(service.id);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      if (
        user.id !== provider.id ||
        service.provider_id !== user.id
      ) {
        throw new Error(
          "Your signed-in account does not match this service's provider. Please sign out and sign in again."
        );
      }

      console.log("Archive diagnostic:", {
        authenticatedUser: user.id,
        providerId: provider.id,
        serviceProviderId: service.provider_id,
        serviceId: service.id,
        newStatus: nextStatus,
      });

      const { error } = await supabase
        .from("services")
        .update({ is_active: nextStatus })
        .eq("id", service.id)
        .eq("provider_id", user.id);

      if (error) throw error;

      setServices((current) =>
        current.map((item) =>
          item.id === service.id
            ? { ...item, is_active: nextStatus }
            : item
        )
      );

      setEditingService((current) =>
        current?.id === service.id
          ? { ...current, is_active: nextStatus }
          : current
      );

      // Automatically show the section the service moved into.
      setServiceFilter(nextStatus ? "active" : "archived");

      showNotice(
        nextStatus
          ? "Service restored successfully."
          : "Service archived successfully. Booking history preserved."
      );
    } catch (error) {
      console.error("Service archive error:", error);

      showNotice(
        error.message || "Could not update service status.",
        "error"
      );
    } finally {
      setUpdatingServiceId(null);
    }
  };

  // PERMANENT DELETE.
  // A service with bookings cannot be deleted.
  const deleteService = async (service) => {
    if (!provider || deletingServiceId || updatingServiceId) return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${service.title}"?`
    );

    if (!confirmed) return;

    setDeletingServiceId(service.id);

    try {
      const {
        count,
        error: bookingError,
      } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("service_id", service.id);

      if (bookingError) throw bookingError;

      if (count > 0) {
        showNotice(
          "This service has existing bookings and cannot be deleted. Its booking history must be preserved. You can archive it instead.",
          "error"
        );
        return;
      }

      const { data, error: deleteError } = await supabase
        .from("services")
        .delete()
        .eq("id", service.id)
        .eq("provider_id", provider.id)
        .select("id");

      if (deleteError) throw deleteError;

      if (!data || data.length === 0) {
        throw new Error(
          "The service was not deleted. Check your Supabase DELETE policy."
        );
      }

      setServices((current) =>
        current.filter((item) => item.id !== service.id)
      );

      if (editingService?.id === service.id) {
        resetServiceForm();
      }

      showNotice("Service deleted successfully.");
    } catch (error) {
      console.error("Service deletion error:", error);

      showNotice(
        error.message || "Could not delete service.",
        "error"
      );
    } finally {
      setDeletingServiceId(null);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const activeServices = services.filter(
    (service) => service.is_active !== false
  );

  const archivedServices = services.filter(
    (service) => service.is_active === false
  );

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  );

  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed"
  );

  // Only Active and Archived are supported filters.
  const filteredServices = useMemo(() => {
    if (serviceFilter === "archived") {
      return services.filter(
        (service) => service.is_active === false
      );
    }

    return services.filter(
      (service) => service.is_active !== false
    );
  }, [services, serviceFilter]);

  const customerPhone = (booking) => {
    return (
      booking.customer_phone ||
      booking.phone ||
      booking.profiles?.phone ||
      ""
    );
  };

  const customerName = (booking) => {
    return (
      booking.customer_name ||
      booking.profiles?.full_name ||
      booking.customer?.full_name ||
      "Customer"
    );
  };

  const openWhatsApp = (booking) => {
    const phone = getPhoneLink(customerPhone(booking)).replace("+", "");

    if (!phone) {
      showNotice(
        "This customer has no saved phone number.",
        "error"
      );
      return;
    }

    const text = encodeURIComponent(
      `Hello ${customerName(booking)}, I'm contacting you about your ${booking.services?.title || "service"} booking.`
    );

    window.open(
      `https://wa.me/${phone}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const callCustomer = (booking) => {
    const phone = getPhoneLink(customerPhone(booking));

    if (!phone) {
      showNotice(
        "This customer has no saved phone number.",
        "error"
      );
      return;
    }

    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="provider-dashboard provider-loading">
        <div className="provider-loader" />
        <p>Loading your business dashboard...</p>
      </div>
    );
  }

  if (!provider) return null;

  return (
    <div className="provider-dashboard">
      <aside className="provider-sidebar">
        <div className="provider-brand">
          <div className="provider-brand-icon">S</div>
          <div>
            <strong>ServeHub</strong>
            <span>Provider workspace</span>
          </div>
        </div>

        <div className="provider-sidebar-profile">
          <img
            src={
              provider.avatar_url ||
              "https://placehold.co/100x100?text=Profile"
            }
            alt="Your profile"
          />
          <div>
            <strong>
              {provider.business_name || provider.full_name}
            </strong>
            <span>Service provider</span>
          </div>
        </div>

        <nav className="provider-navigation">
          <span className="provider-nav-label">WORKSPACE</span>

          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={
                activeSection === section.id
                  ? "provider-nav-link active"
                  : "provider-nav-link"
              }
              onClick={() => setActiveSection(section.id)}
            >
              <span className="provider-nav-icon">
                {section.icon}
              </span>
              <span>{section.label}</span>

              {section.id === "bookings" &&
                pendingBookings.length > 0 && (
                  <span className="provider-nav-count">
                    {pendingBookings.length}
                  </span>
                )}
            </button>
          ))}
        </nav>

        <div className="provider-sidebar-bottom">
          <button
            type="button"
            className="provider-nav-link"
            onClick={logout}
          >
            <span className="provider-nav-icon">↪</span>
            Sign out
          </button>
        </div>
      </aside>

      <main className="provider-main">
        <header className="provider-topbar">
          <div>
            <span className="provider-eyebrow">YOUR WORKSPACE</span>
            <h1>
              {sections.find(
                (item) => item.id === activeSection
              )?.label || "Overview"}
            </h1>
          </div>

          <div className="provider-topbar-actions">
            <span
              className={
                provider.is_online
                  ? "provider-status online"
                  : "provider-status offline"
              }
            >
              <span className="provider-status-dot" />
              {provider.is_online ? "Online" : "Offline"}
            </span>

            <button
              type="button"
              className="provider-avatar-button"
              onClick={() => setActiveSection("profile")}
              title="Open profile"
            >
              <img
                src={
                  provider.avatar_url ||
                  "https://placehold.co/100x100?text=Profile"
                }
                alt="Profile"
              />
            </button>
          </div>
        </header>

        {notice.text && (
          <div
            className={`provider-alert ${
              notice.type === "error"
                ? "provider-alert-error"
                : "provider-alert-success"
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* OVERVIEW */}
        {activeSection === "overview" && (
          <section className="provider-content">
            <div className="provider-welcome-card">
              <div>
                <span className="provider-eyebrow">
                  BUSINESS OVERVIEW
                </span>
                <h2>
                  Welcome back, {provider.full_name || "Provider"}!
                </h2>
                <p>
                  Keep track of your services, customer requests, and
                  business activity from one place.
                </p>
              </div>

              <button
                type="button"
                className="provider-primary-button"
                onClick={() => {
                  resetServiceForm();
                  setActiveSection("services");
                }}
              >
                + Add a service
              </button>
            </div>

            <div className="provider-stats-grid">
              <div className="provider-stat-card">
                <span>Total services</span>
                <strong>{services.length}</strong>
                <small>All listed services</small>
              </div>

              <div className="provider-stat-card">
                <span>Active services</span>
                <strong>{activeServices.length}</strong>
                <small>Currently available</small>
              </div>

              <div className="provider-stat-card">
                <span>Archived services</span>
                <strong>{archivedServices.length}</strong>
                <small>Hidden from customers</small>
              </div>

              <div className="provider-stat-card">
                <span>Total bookings</span>
                <strong>{bookings.length}</strong>
                <small>Customer requests received</small>
              </div>

              <div className="provider-stat-card">
                <span>Pending requests</span>
                <strong>{pendingBookings.length}</strong>
                <small>Waiting for your response</small>
              </div>

              <div className="provider-stat-card">
                <span>Completed bookings</span>
                <strong>{completedBookings.length}</strong>
                <small>Successfully completed</small>
              </div>
            </div>

            <div className="provider-dashboard-grid">
              <div className="provider-section">
                <div className="provider-section-heading">
                  <div>
                    <h2>Recent bookings</h2>
                    <p>Your latest customer requests</p>
                  </div>

                  <button
                    type="button"
                    className="provider-text-button"
                    onClick={() => setActiveSection("bookings")}
                  >
                    View all
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div className="provider-empty-state">
                    <span>▤</span>
                    <h3>No bookings yet</h3>
                    <p>Customer bookings will appear here.</p>
                  </div>
                ) : (
                  <div className="provider-booking-list">
                    {bookings.slice(0, 5).map((booking) => (
                      <div
                        className="provider-booking-card"
                        key={booking.id}
                      >
                        <div>
                          <strong>{customerName(booking)}</strong>
                          <p>
                            {booking.services?.title ||
                              "Selected service"}
                          </p>
                          <small>
                            {formatDate(booking.created_at)}
                          </small>
                        </div>

                        <span
                          className={`provider-booking-status ${booking.status}`}
                        >
                          {booking.status || "pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="provider-section provider-quick-actions">
                <div className="provider-section-heading">
                  <div>
                    <h2>Quick actions</h2>
                    <p>Manage your business</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSection("bookings")}
                >
                  <span>▤</span>
                  Manage bookings
                  <b>→</b>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("messages")}
                >
                  <span>▣</span>
                  Customer messages
                  <b>→</b>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("services")}
                >
                  <span>◇</span>
                  Manage services
                  <b>→</b>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("profile")}
                >
                  <span>◎</span>
                  Edit profile
                  <b>→</b>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* BOOKINGS */}
        {activeSection === "bookings" && (
          <section className="provider-content">
            <div className="provider-section-heading">
              <div>
                <h2>Customer bookings</h2>
                <p>
                  Review requests and manage their progress.
                </p>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="provider-empty-state">
                <h3>No bookings found</h3>
                <p>Your customer bookings will appear here.</p>
              </div>
            ) : (
              <div className="provider-booking-list">
                {bookings.map((booking) => (
                  <article
                    className="provider-booking-card"
                    key={booking.id}
                  >
                    <div className="provider-booking-information">
                      <span className="provider-eyebrow">
                        {booking.services?.title ||
                          "Selected service"}
                      </span>

                      <h3>{customerName(booking)}</h3>

                      <p>
                        Booking date: {formatDate(booking.created_at)}
                      </p>

                      {booking.services?.price != null && (
                        <p>
                          Service price:{" "}
                          {formatPrice(booking.services.price)}
                        </p>
                      )}

                      <span
                        className={`provider-booking-status ${booking.status}`}
                      >
                        {booking.status || "pending"}
                      </span>
                    </div>

                    <div className="provider-card-actions">
                      <button
                        type="button"
                        className="provider-secondary-button"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setActiveSection("messages");
                        }}
                      >
                        Message customer
                      </button>

                      <button
                        type="button"
                        className="provider-whatsapp-button"
                        onClick={() => openWhatsApp(booking)}
                      >
                        WhatsApp
                      </button>

                      <button
                        type="button"
                        className="provider-secondary-button"
                        onClick={() => callCustomer(booking)}
                      >
                        Call
                      </button>

                      {booking.status === "pending" && (
                        <>
                          <button
                            type="button"
                            className="provider-primary-button"
                            onClick={() =>
                              updateBookingStatus(
                                booking.id,
                                "accepted"
                              )
                            }
                          >
                            Accept
                          </button>

                          <button
                            type="button"
                            className="provider-danger-button"
                            onClick={() =>
                              updateBookingStatus(
                                booking.id,
                                "rejected"
                              )
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {booking.status === "accepted" && (
                        <button
                          type="button"
                          className="provider-primary-button"
                          onClick={() =>
                            updateBookingStatus(
                              booking.id,
                              "completed"
                            )
                          }
                        >
                          Mark completed
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* CUSTOMER CHAT */}
        {activeSection === "messages" && (
          <section className="provider-content">
            <div className="provider-section-heading">
              <div>
                <h2>Customer conversations</h2>
                <p>
                  Chat with customers about the services they selected.
                </p>
              </div>
            </div>

            <div className="provider-chat-layout">
              <div className="provider-chat-bookings">
                <h3>Your customers</h3>

                {bookings.length === 0 ? (
                  <p className="provider-muted-text">
                    Customers will appear here when they book your
                    services.
                  </p>
                ) : (
                  bookings.map((booking) => (
                    <button
                      type="button"
                      key={booking.id}
                      className={
                        selectedBooking?.id === booking.id
                          ? "provider-chat-customer active"
                          : "provider-chat-customer"
                      }
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <span className="provider-chat-customer-avatar">
                        {customerName(booking)
                          .charAt(0)
                          .toUpperCase()}
                      </span>

                      <span>
                        <strong>{customerName(booking)}</strong>
                        <small>
                          {booking.services?.title ||
                            "Selected service"}
                        </small>
                      </span>
                    </button>
                  ))
                )}
              </div>

              <div className="provider-chat-window">
                {selectedBooking ? (
                  <>
                    <div className="provider-chat-header">
                      <div>
                        <h3>{customerName(selectedBooking)}</h3>
                        <p>
                          {selectedBooking.services?.title ||
                            "Selected service"}
                        </p>
                      </div>

                      <div className="provider-chat-contact-actions">
                        <button
                          type="button"
                          className="provider-whatsapp-button"
                          onClick={() =>
                            openWhatsApp(selectedBooking)
                          }
                        >
                          WhatsApp
                        </button>

                        <button
                          type="button"
                          className="provider-secondary-button"
                          onClick={() =>
                            callCustomer(selectedBooking)
                          }
                        >
                          Call
                        </button>
                      </div>
                    </div>

                    <div className="provider-chat-messages">
                      {messages.length === 0 ? (
                        <div className="provider-empty-state">
                          <h3>Start the conversation</h3>
                          <p>
                            Send a message to discuss this customer's
                            selected service.
                          </p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isMine =
                            message.sender_id === provider.id;

                          return (
                            <div
                              key={message.id}
                              className={
                                isMine
                                  ? "provider-message mine"
                                  : "provider-message"
                              }
                            >
                              <p>{message.message}</p>
                              <small>
                                {new Date(
                                  message.created_at
                                ).toLocaleString()}
                              </small>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <form
                      className="provider-chat-form"
                      onSubmit={sendMessage}
                    >
                      <input
                        type="text"
                        value={chatText}
                        onChange={(event) =>
                          setChatText(event.target.value)
                        }
                        placeholder="Write a message..."
                        aria-label="Write a message"
                      />

                      <button
                        type="submit"
                        className="provider-primary-button"
                        disabled={
                          sendingMessage || !chatText.trim()
                        }
                      >
                        {sendingMessage ? "Sending..." : "Send"}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="provider-empty-state">
                    <span>▣</span>
                    <h3>Select a customer</h3>
                    <p>
                      Choose a customer on the left to open their
                      conversation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* SERVICES */}
        {activeSection === "services" && (
          <section className="provider-content">
            <div className="provider-section-heading">
              <div>
                <h2>Manage your services</h2>
                <p>Add, edit, archive, restore, or delete your services.</p>
              </div>
            </div>

            <div className="provider-section">
              <h3>
                {editingService ? "Edit service" : "Add a new service"}
              </h3>

              <form className="provider-form" onSubmit={saveService}>
                <label>
                  Service title
                  <input
                    required
                    value={serviceForm.title}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        title: event.target.value,
                      })
                    }
                    placeholder="e.g. Home cleaning"
                  />
                </label>

                <label>
                  Category
                  <select
                    required
                    value={serviceForm.category}
                    onChange={(event) => {
                      setServiceForm({
                        ...serviceForm,
                        category: event.target.value,
                      });

                      if (event.target.value !== "Other") {
                        setCustomCategory("");
                      }
                    }}
                  >
                    <option value="">Select a category</option>

                    {serviceCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                {serviceForm.category === "Other" && (
                  <label>
                    Enter your category
                    <input
                      required
                      value={customCategory}
                      onChange={(event) =>
                        setCustomCategory(event.target.value)
                      }
                      placeholder="Enter your service category"
                    />
                  </label>
                )}

                <label>
                  Price (₦)
                  <input
                    required
                    min="0"
                    type="number"
                    value={serviceForm.price}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        price: event.target.value,
                      })
                    }
                    placeholder="Enter your price"
                  />
                </label>

                <label>
                  Location
                  <input
                    value={serviceForm.location}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        location: event.target.value,
                      })
                    }
                    placeholder="Your service location"
                  />
                </label>

                <label className="provider-form-full">
                  Description
                  <textarea
                    required
                    rows="4"
                    value={serviceForm.description}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="Describe what your service offers..."
                  />
                </label>

                <div className="provider-service-image-upload provider-form-full">
                  <label htmlFor="service-image">
                    Service image
                  </label>

                  <div className="provider-service-image-preview">
                    {serviceImagePreview ? (
                      <img
                        src={serviceImagePreview}
                        alt="Service preview"
                      />
                    ) : (
                      <div className="provider-service-image-placeholder">
                        <span>▧</span>
                        <p>
                          Your service image preview will appear here.
                        </p>
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="service-image"
                    className="provider-service-image-button"
                  >
                    {serviceImageFile
                      ? "Choose a different image"
                      : editingService?.image_url
                        ? "Change service image"
                        : "Choose service image"}
                  </label>

                  <input
                    id="service-image"
                    className="provider-service-image-input"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleServiceImageChange}
                    disabled={saving || uploadingServiceImage}
                  />

                  <small className="provider-service-image-help">
                    JPG, PNG, or WebP. Maximum 5MB.
                    {editingService?.image_url && !serviceImageFile
                      ? " Your current image will be kept if you don't choose another."
                      : ""}
                  </small>
                </div>

                <div className="provider-form-actions provider-form-full">
                  <button
                    type="submit"
                    className="provider-primary-button"
                    disabled={saving || uploadingServiceImage}
                  >
                    {uploadingServiceImage
                      ? "Uploading image..."
                      : saving
                        ? "Saving..."
                        : editingService
                          ? "Update service"
                          : "Add service"}
                  </button>

                  {editingService && (
                    <button
                      type="button"
                      className="provider-secondary-button"
                      onClick={resetServiceForm}
                    >
                      Cancel editing
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="provider-section">
              <div className="provider-section-heading">
                <div>
                  <h2>Your service listings</h2>
                  <p>
                    Manage the services customers can find.
                  </p>
                </div>

                <div className="provider-filter-actions">
                  {["active", "archived"].map((filter) => (
                    <button
                      type="button"
                      key={filter}
                      className={
                        serviceFilter === filter
                          ? "provider-filter active"
                          : "provider-filter"
                      }
                      onClick={() => setServiceFilter(filter)}
                    >
                      {filter.charAt(0).toUpperCase() +
                        filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {filteredServices.length === 0 ? (
                <div className="provider-empty-state">
                  <h3>
                    {serviceFilter === "archived"
                      ? "No archived services"
                      : "No active services"}
                  </h3>
                  <p>
                    {serviceFilter === "archived"
                      ? "Services you archive will appear here."
                      : "Add a service to make it available to customers."}
                  </p>
                </div>
              ) : (
                <div className="provider-service-grid">
                  {filteredServices.map((service) => (
                    <article
                      className="provider-service-card"
                      key={service.id}
                    >
                      {service.image_url ? (
                        <img
                          className="provider-service-card-image"
                          src={service.image_url}
                          alt={service.title}
                        />
                      ) : (
                        <div className="provider-service-card-image-placeholder">
                          ▧
                        </div>
                      )}

                      <div className="provider-card-heading">
                        <span>
                          {service.category || "Service"}
                        </span>

                        <span
                          className={
                            service.is_active !== false
                              ? "provider-status online"
                              : "provider-status offline"
                          }
                        >
                          {service.is_active !== false
                            ? "Active"
                            : "Archived"}
                        </span>
                      </div>

                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                      <strong>{formatPrice(service.price)}</strong>
                      <small>
                        {service.location ||
                          "Location not specified"}
                      </small>

                      <div className="provider-card-actions">
                        <button
                          type="button"
                          className="provider-secondary-button"
                          onClick={() =>
                            startEditingService(service)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="provider-archive-button"
                          onClick={() =>
                            toggleServiceArchive(service)
                          }
                          disabled={
                            updatingServiceId === service.id ||
                            deletingServiceId === service.id
                          }
                        >
                          {updatingServiceId === service.id
                            ? "Updating..."
                            : service.is_active === false
                              ? "Restore Service"
                              : "Archive Service"}
                        </button>

                        <button
                          type="button"
                          className="provider-danger-button"
                          onClick={() => deleteService(service)}
                          disabled={
                            deletingServiceId === service.id ||
                            updatingServiceId === service.id
                          }
                        >
                          {deletingServiceId === service.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* PORTFOLIO */}
        {activeSection === "portfolio" && (
          <section className="provider-content">
            <div className="provider-section-heading">
              <div>
                <h2>Your portfolio</h2>
                <p>
                  Showcase examples of your work to help customers
                  choose your services.
                </p>
              </div>
            </div>

            <div className="provider-section">
              <div className="provider-empty-state">
                <span>▧</span>
                <h3>Portfolio setup needs your table structure</h3>
                <p>
                  I have not assumed the column names in your
                  provider_portfolio table. We'll connect portfolio
                  uploads, editing, and removal after confirming its
                  columns.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* PROFILE */}
        {activeSection === "profile" && (
          <section className="provider-content">
            <div className="provider-section-heading">
              <div>
                <h2>Business profile</h2>
                <p>Keep your information up to date.</p>
              </div>
            </div>

            <div className="provider-section provider-profile-section">
              <div className="provider-profile-picture">
                <img
                  src={
                    provider.avatar_url ||
                    "https://placehold.co/160x160?text=Profile"
                  }
                  alt="Your profile"
                />

                <label className="provider-upload-button">
                  {uploadingAvatar
                    ? "Uploading..."
                    : "Change picture"}

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={uploadAvatar}
                    disabled={uploadingAvatar}
                    hidden
                  />
                </label>

                <small>
                  JPG, PNG, or WebP. Maximum 2MB.
                </small>
              </div>

              <form className="provider-form" onSubmit={saveProfile}>
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
                  Business name
                  <input
                    value={profileForm.business_name}
                    onChange={(event) =>
                      setProfileForm({
                        ...profileForm,
                        business_name: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Phone number
                  <input
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

                <div className="provider-form-actions provider-form-full">
                  <button
                    type="submit"
                    className="provider-primary-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save profile"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* AVAILABILITY */}
        {activeSection === "availability" && (
          <section className="provider-content">
            <div className="provider-section-heading">
              <div>
                <h2>Availability</h2>
                <p>
                  Control whether customers see you as available.
                </p>
              </div>
            </div>

            <div className="provider-section provider-availability-card">
              <div>
                <span className="provider-eyebrow">
                  YOUR CURRENT STATUS
                </span>
                <h2>
                  {provider.is_online
                    ? "You are online"
                    : "You are offline"}
                </h2>
                <p>
                  {provider.is_online
                    ? "Customers can see that you are available."
                    : "Your profile is currently marked as unavailable."}
                </p>
              </div>

              <button
                type="button"
                className={
                  provider.is_online
                    ? "provider-danger-button"
                    : "provider-primary-button"
                }
                onClick={toggleOnlineStatus}
              >
                {provider.is_online
                  ? "Go offline"
                  : "Go online"}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
