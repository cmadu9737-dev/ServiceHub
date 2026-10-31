
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  Search,
  MapPin,
  LogOut,
  BriefcaseBusiness,
  User,
  Mail,
  Phone,
  Camera,
  Pencil,
  X,
  Save,
} from "lucide-react";
import "./CustomerDashboard.css";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const [pictureFile, setPictureFile] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("full_name, email, phone, location, role, avatar_url")
          .eq("id", user.id)
          .single();

      if (profileError) throw profileError;

      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || "",
        phone: profileData.phone || "",
        location: profileData.location || "",
      });

      const { data: servicesData, error: servicesError } =
        await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

      if (servicesError) throw servicesError;

      setServices(servicesData || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Your picture must be smaller than 2 MB.");
      return;
    }

    setError("");
    setPictureFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please log in again.");

      let avatarUrl = profile?.avatar_url || "";

      if (pictureFile) {
        const fileExtension = pictureFile.name.split(".").pop().toLowerCase();
        const filePath = `${user.id}/profile-${Date.now()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-pictures")
          .upload(filePath, pictureFile, {
            upsert: false,
            contentType: pictureFile.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("profile-pictures")
          .getPublicUrl(filePath);

        avatarUrl = publicUrlData.publicUrl;
      }

      const { data: updatedProfile, error: updateError } =
        await supabase
          .from("profiles")
          .update({
            full_name: formData.full_name.trim(),
            phone: formData.phone.trim(),
            location: formData.location.trim(),
            avatar_url: avatarUrl || null,
          })
          .eq("id", user.id)
          .select("full_name, email, phone, location, role, avatar_url")
          .single();

      if (updateError) throw updateError;

      setProfile(updatedProfile);
      setFormData({
        full_name: updatedProfile.full_name || "",
        phone: updatedProfile.phone || "",
        location: updatedProfile.location || "",
      });

      setEditing(false);
      setPictureFile(null);
      setPreview("");
    } catch (err) {
      setError(err.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      location: profile?.location || "",
    });
    setPictureFile(null);
    setPreview("");
    setEditing(false);
    setError("");
  };

  const handleLogout = async () => {
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    navigate("/login");
  };

  const filteredServices = services.filter((service) =>
    `${service.title || ""} ${service.category || ""} ${
      service.location || ""
    }`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="customer-dashboard">
        <p className="dashboard-message">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <BriefcaseBusiness size={28} />
          <h2>ServeHub</h2>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          Log Out
        </button>
      </header>

      <main className="dashboard-content">
        {error && <p className="dashboard-error">{error}</p>}

        <section className="dashboard-welcome">
          <p className="dashboard-label">CUSTOMER DASHBOARD</p>
          <h1>Welcome, {profile?.full_name || "Customer"}!</h1>
          <p>
            Discover trusted service providers and find the help you need.
          </p>

          <div className="service-search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search for a service or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        <section className="customer-profile">
          <div className="profile-heading">
            <h2>My Profile</h2>

            {!editing && (
              <button
                className="edit-profile-button"
                onClick={() => setEditing(true)}
              >
                <Pencil size={17} />
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <div className="edit-profile-form">
              <div className="picture-upload">
                <img
                  src={
                    preview ||
                    profile?.avatar_url ||
                    "https://placehold.co/120x120?text=Photo"
                  }
                  alt="Profile preview"
                  className="profile-avatar"
                />

                <label className="upload-picture-button">
                  <Camera size={17} />
                  Change Picture
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePictureChange}
                    hidden
                  />
                </label>
              </div>

              <label>
                Full Name
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      full_name: e.target.value,
                    })
                  }
                  placeholder="Enter your full name"
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Enter your phone number"
                />
              </label>

              <label>
                Location
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: e.target.value,
                    })
                  }
                  placeholder="Enter your location"
                />
              </label>

              <div className="profile-form-actions">
                <button
                  className="save-profile-button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  className="cancel-profile-button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  <X size={17} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="profile-picture-display">
                <img
                  src={
                    profile?.avatar_url ||
                    "https://placehold.co/120x120?text=Photo"
                  }
                  alt="Customer profile"
                  className="profile-avatar"
                />
              </div>

              <div className="profile-details">
                <div className="profile-item">
                  <User size={20} />
                  <div>
                    <span>Full Name</span>
                    <strong>{profile?.full_name || "Not provided"}</strong>
                  </div>
                </div>

                <div className="profile-item">
                  <Mail size={20} />
                  <div>
                    <span>Email Address</span>
                    <strong>{profile?.email || "Not provided"}</strong>
                  </div>
                </div>

                <div className="profile-item">
                  <Phone size={20} />
                  <div>
                    <span>Phone Number</span>
                    <strong>{profile?.phone || "Not provided"}</strong>
                  </div>
                </div>

                <div className="profile-item">
                  <MapPin size={20} />
                  <div>
                    <span>Location</span>
                    <strong>{profile?.location || "Not provided"}</strong>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="available-services">
          <div className="services-heading">
            <h2>Available Services</h2>
            <span>{filteredServices.length} services</span>
          </div>

          {!error && filteredServices.length === 0 && (
            <div className="empty-services">
              <BriefcaseBusiness size={42} />
              <h3>No services found</h3>
              <p>
                {searchTerm
                  ? "Try searching with a different word."
                  : "There are no active services available yet."}
              </p>
            </div>
          )}

          <div className="services-grid">
            {filteredServices.map((service) => (
              <article className="service-card" key={service.id}>
                <span className="service-category">
                  {service.category || "General Service"}
                </span>

                <h3>{service.title}</h3>

                <p className="service-description">
                  {service.description || "No description provided."}
                </p>

                <div className="service-location">
                  <MapPin size={17} />
                  <span>
                    {service.location || "Location not specified"}
                  </span>
                </div>

                <div className="service-card-footer">
                  <strong>
                    {service.price != null
                      ? `₦${Number(service.price).toLocaleString()}`
                      : "Price not listed"}
                  </strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default CustomerDashboard;
