
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  BriefcaseBusiness,
  LogOut,
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Pencil,
  Camera,
  ImagePlus,
  Save,
} from "lucide-react";
import "./ProviderDashboard.css";

const BUCKET = "profile-pictures";

const emptyService = {
  title: "",
  description: "",
  category: "",
  price: "",
  location: "",
};

const emptyPortfolio = {
  title: "",
  description: "",
};

function ProviderDashboard() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    business_name: "",
    phone: "",
    location: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState(emptyService);

  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);
  const [portfolioForm, setPortfolioForm] = useState(emptyPortfolio);
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioPreview, setPortfolioPreview] = useState("");

  useEffect(() => {
    fetchProviderData();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }

      if (portfolioPreview.startsWith("blob:")) {
        URL.revokeObjectURL(portfolioPreview);
      }
    };
  }, [avatarPreview, portfolioPreview]);

  const fetchProviderData = async () => {
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

      setUserId(user.id);

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select(
            "full_name, email, phone, location, business_name, avatar_url, role"
          )
          .eq("id", user.id)
          .single();

      if (profileError) throw profileError;

      if (profileData.role !== "provider") {
        navigate("/customer-dashboard");
        return;
      }

      setProfile(profileData);

      setProfileForm({
        full_name: profileData.full_name || "",
        business_name: profileData.business_name || "",
        phone: profileData.phone || "",
        location: profileData.location || "",
      });

      const [
        { data: servicesData, error: servicesError },
        { data: portfolioData, error: portfolioError },
      ] = await Promise.all([
        supabase
          .from("services")
          .select("*")
          .eq("provider_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("provider_portfolio")
          .select("*")
          .eq("provider_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (servicesError) throw servicesError;
      if (portfolioError) throw portfolioError;

      setServices(servicesData || []);
      setPortfolio(portfolioData || []);
    } catch (err) {
      setError(err.message || "Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file, folder) => {
    if (!file) return null;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Please choose a JPG, PNG, or WEBP image."
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error(
        "Each image must be 2 MB or smaller."
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const path = `${userId}/${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return {
      path,
      url: data.publicUrl,
    };
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    let uploadedPath = null;

    try {
      let avatarUrl = profile?.avatar_url || null;

      if (avatarFile) {
        const uploaded = await uploadImage(
          avatarFile,
          "avatar"
        );

        avatarUrl = uploaded.url;
        uploadedPath = uploaded.path;
      }

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name.trim(),
          business_name: profileForm.business_name.trim(),
          phone: profileForm.phone.trim(),
          location: profileForm.location.trim(),
          avatar_url: avatarUrl,
        })
        .eq("id", userId)
        .select(
          "full_name, email, phone, location, business_name, avatar_url, role"
        )
        .single();

      if (updateError) throw updateError;

      setProfile(data);
      setAvatarFile(null);
      setAvatarPreview("");
      setEditingProfile(false);

      setSuccess(
        "Your provider profile has been updated."
      );
    } catch (err) {
      if (uploadedPath) {
        await supabase.storage
          .from(BUCKET)
          .remove([uploadedPath]);
      }

      setError(
        err.message || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelProfileEdit = () => {
    setProfileForm({
      full_name: profile?.full_name || "",
      business_name: profile?.business_name || "",
      phone: profile?.phone || "",
      location: profile?.location || "",
    });

    setAvatarFile(null);
    setAvatarPreview("");
    setEditingProfile(false);
    setError("");
  };

  const handleAddService = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error: insertError } = await supabase
        .from("services")
        .insert({
          provider_id: userId,
          title: serviceForm.title.trim(),
          description: serviceForm.description.trim(),
          category: serviceForm.category.trim(),
          price: Number(serviceForm.price),
          location: serviceForm.location.trim(),
          is_active: true,
        });

      if (insertError) throw insertError;

      setServiceForm(emptyService);
      setShowServiceForm(false);

      setSuccess(
        "Your service has been added successfully."
      );

      await fetchProviderData();
    } catch (err) {
      setError(
        err.message || "Unable to add your service."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this service?"
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setServices((current) =>
      current.filter((item) => item.id !== serviceId)
    );

    setSuccess("Service deleted successfully.");
  };

  const handlePortfolioFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (portfolioPreview.startsWith("blob:")) {
      URL.revokeObjectURL(portfolioPreview);
    }

    setPortfolioFile(file);
    setPortfolioPreview(URL.createObjectURL(file));
    setError("");
  };

  const startPortfolioEdit = (item) => {
    setEditingPortfolioId(item.id);

    setPortfolioForm({
      title: item.title || "",
      description: item.description || "",
    });

    setPortfolioFile(null);
    setPortfolioPreview(item.image_url || "");
    setShowPortfolioForm(true);
    setError("");
    setSuccess("");
  };

  const resetPortfolioForm = () => {
    setShowPortfolioForm(false);
    setEditingPortfolioId(null);
    setPortfolioForm(emptyPortfolio);
    setPortfolioFile(null);
    setPortfolioPreview("");
  };

  const handleSavePortfolio = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    let uploadedPath = null;

    try {
      const existingItem = portfolio.find(
        (item) => item.id === editingPortfolioId
      );

      let imageUrl = existingItem?.image_url || "";
      let imagePath = existingItem?.image_path || "";

      if (portfolioFile) {
        const uploaded = await uploadImage(
          portfolioFile,
          "portfolio"
        );

        imageUrl = uploaded.url;
        imagePath = uploaded.path;
        uploadedPath = uploaded.path;
      }

      if (!imageUrl) {
        throw new Error(
          "Please select a portfolio image."
        );
      }

      const values = {
        provider_id: userId,
        title: portfolioForm.title.trim(),
        description: portfolioForm.description.trim(),
        image_url: imageUrl,
        image_path: imagePath,
      };

      let saveError;

      if (editingPortfolioId) {
        const result = await supabase
          .from("provider_portfolio")
          .update({
            title: values.title,
            description: values.description,
            image_url: values.image_url,
            image_path: values.image_path,
          })
          .eq("id", editingPortfolioId)
          .eq("provider_id", userId);

        saveError = result.error;
      } else {
        const result = await supabase
          .from("provider_portfolio")
          .insert(values);

        saveError = result.error;
      }

      if (saveError) throw saveError;

      if (
        editingPortfolioId &&
        existingItem?.image_path &&
        portfolioFile &&
        existingItem.image_path !== imagePath
      ) {
        await supabase.storage
          .from(BUCKET)
          .remove([existingItem.image_path]);
      }

      resetPortfolioForm();

      setSuccess(
        editingPortfolioId
          ? "Portfolio item updated."
          : "Portfolio item added."
      );

      await fetchProviderData();
    } catch (err) {
      if (uploadedPath) {
        await supabase.storage
          .from(BUCKET)
          .remove([uploadedPath]);
      }

      setError(
        err.message || "Unable to save this portfolio item."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePortfolio = async (item) => {
    if (
      !window.confirm("Delete this portfolio item?")
    ) {
      return;
    }

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("provider_portfolio")
      .delete()
      .eq("id", item.id)
      .eq("provider_id", userId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (item.image_path) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([item.image_path]);

      if (storageError) {
        setError(
          `Portfolio entry deleted, but its image could not be removed: ${storageError.message}`
        );
      }
    }

    setPortfolio((current) =>
      current.filter((entry) => entry.id !== item.id)
    );

    setSuccess("Portfolio item deleted.");
  };

  const handleLogout = async () => {
    const { error: logoutError } =
      await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="provider-dashboard">
        <p className="dashboard-message">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      <header className="provider-header">
        <div className="provider-brand">
          <BriefcaseBusiness size={28} />
          <h2>ServeHub</h2>
        </div>

        <button
          className="provider-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Log Out
        </button>
      </header>

      <main className="provider-content">
        {error && (
          <p className="provider-error">{error}</p>
        )}

        {success && (
          <p className="provider-success">{success}</p>
        )}

        <section className="provider-welcome">
          <p className="provider-label">
            PROVIDER DASHBOARD
          </p>

          <h1>
            Welcome,{" "}
            {profile?.business_name ||
              profile?.full_name ||
              "Provider"}
            !
          </h1>

          <p>
            Manage your services, showcase your work,
            and connect with customers.
          </p>
        </section>

        {/* BUSINESS PROFILE */}
        <section className="provider-profile">
          <div className="provider-section-heading">
            <div>
              <h2>Business Profile</h2>
              <p>
                Keep your provider information up to date.
              </p>
            </div>

            {!editingProfile && (
              <button
                className="provider-secondary-button"
                onClick={() => setEditingProfile(true)}
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {editingProfile ? (
            <form
              className="provider-edit-form"
              onSubmit={handleSaveProfile}
            >
              <div className="provider-avatar-editor">
                <img
                  className="provider-avatar"
                  src={
                    avatarPreview ||
                    profile?.avatar_url ||
                    "https://placehold.co/120x120?text=Photo"
                  }
                  alt="Provider profile"
                />

                <label className="provider-upload-button">
                  <Camera size={17} />
                  Change Picture

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleAvatarChange}
                  />
                </label>

                <small>
                  JPG, PNG, or WEBP. Maximum 2 MB.
                </small>
              </div>

              <div className="provider-edit-grid">
                <label>
                  Full Name
                  <input
                    required
                    value={profileForm.full_name}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        full_name: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Business Name
                  <input
                    value={profileForm.business_name}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        business_name: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        phone: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Location
                  <input
                    value={profileForm.location}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        location: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="provider-form-actions">
                <button type="submit" disabled={saving}>
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Profile"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelProfileEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="provider-profile-view">
              <img
                className="provider-avatar"
                src={
                  profile?.avatar_url ||
                  "https://placehold.co/120x120?text=Photo"
                }
                alt="Provider profile"
              />

              <div className="provider-profile-details">
                <div>
                  <User size={20} />
                  <span>
                    <small>Full Name</small>
                    <strong>
                      {profile?.full_name || "Not provided"}
                    </strong>
                  </span>
                </div>

                <div>
                  <BriefcaseBusiness size={20} />
                  <span>
                    <small>Business Name</small>
                    <strong>
                      {profile?.business_name || "Not provided"}
                    </strong>
                  </span>
                </div>

                <div>
                  <Mail size={20} />
                  <span>
                    <small>Email</small>
                    <strong>
                      {profile?.email || "Not provided"}
                    </strong>
                  </span>
                </div>

                <div>
                  <Phone size={20} />
                  <span>
                    <small>Phone</small>
                    <strong>
                      {profile?.phone || "Not provided"}
                    </strong>
                  </span>
                </div>

                <div>
                  <MapPin size={20} />
                  <span>
                    <small>Location</small>
                    <strong>
                      {profile?.location || "Not provided"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SERVICES */}
        <section className="provider-services">
          <div className="provider-services-heading">
            <div>
              <h2>My Services</h2>
              <p>{services.length} services listed</p>
            </div>

            <button
              className="add-service-button"
              onClick={() =>
                setShowServiceForm(!showServiceForm)
              }
            >
              <Plus size={18} />
              Add Service
            </button>
          </div>

          {showServiceForm && (
            <form
              className="add-service-form"
              onSubmit={handleAddService}
            >
              <h3>Add a New Service</h3>

              <label>
                Service Title
                <input
                  required
                  value={serviceForm.title}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Plumbing"
                />
              </label>

              <label>
                Description
                <textarea
                  required
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the service you provide"
                />
              </label>

              <label>
                Category
                <input
                  required
                  value={serviceForm.category}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      category: e.target.value,
                    })
                  }
                  placeholder="e.g. Home Services"
                />
              </label>

              <label>
                Price (₦)
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={serviceForm.price}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      price: e.target.value,
                    })
                  }
                  placeholder="Enter your price"
                />
              </label>

              <label>
                Service Location
                <input
                  required
                  value={serviceForm.location}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      location: e.target.value,
                    })
                  }
                  placeholder="Where do you provide this service?"
                />
              </label>

              <div className="provider-form-actions">
                <button type="submit" disabled={saving}>
                  {saving ? "Adding..." : "Save Service"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowServiceForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {services.length === 0 ? (
            <div className="provider-empty">
              <BriefcaseBusiness size={40} />
              <h3>No services added yet</h3>
              <p>
                Click Add Service to list your first service.
              </p>
            </div>
          ) : (
            <div className="provider-services-grid">
              {services.map((service) => (
                <article
                  className="provider-service-card"
                  key={service.id}
                >
                  <span>
                    {service.category || "General Service"}
                  </span>

                  <h3>{service.title}</h3>
                  <p>{service.description}</p>

                  <div className="provider-service-location">
                    <MapPin size={16} />
                    {service.location ||
                      "Location not specified"}
                  </div>

                  <div className="provider-service-footer">
                    <strong>
                      ₦
                      {Number(
                        service.price || 0
                      ).toLocaleString()}
                    </strong>

                    <button
                      onClick={() =>
                        handleDeleteService(service.id)
                      }
                      aria-label={`Delete ${service.title}`}
                      title="Delete service"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* PORTFOLIO */}
        <section className="provider-portfolio">
          <div className="provider-services-heading">
            <div>
              <h2>My Work Portfolio</h2>
              <p>
                {portfolio.length} portfolio projects
              </p>
            </div>

            <button
              className="add-service-button"
              onClick={() => {
                resetPortfolioForm();
                setShowPortfolioForm(true);
              }}
            >
              <ImagePlus size={18} />
              Add Work
            </button>
          </div>

          {showPortfolioForm && (
            <form
              className="add-service-form"
              onSubmit={handleSavePortfolio}
            >
              <h3>
                {editingPortfolioId
                  ? "Edit Portfolio Item"
                  : "Add Portfolio Item"}
              </h3>

              <label>
                Project Title
                <input
                  required
                  value={portfolioForm.title}
                  onChange={(e) =>
                    setPortfolioForm({
                      ...portfolioForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Kitchen renovation"
                />
              </label>

              <label>
                Work Description
                <textarea
                  value={portfolioForm.description}
                  onChange={(e) =>
                    setPortfolioForm({
                      ...portfolioForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the work you completed"
                />
              </label>

              <label>
                Project Photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePortfolioFileChange}
                  required={!editingPortfolioId}
                />
              </label>

              {portfolioPreview && (
                <img
                  className="portfolio-form-preview"
                  src={portfolioPreview}
                  alt="Portfolio preview"
                />
              )}

              <small>
                JPG, PNG, or WEBP. Maximum 2 MB.
              </small>

              <div className="provider-form-actions">
                <button type="submit" disabled={saving}>
                  <Save size={16} />
                  {saving
                    ? "Saving..."
                    : "Save Portfolio Item"}
                </button>

                <button
                  type="button"
                  onClick={resetPortfolioForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {portfolio.length === 0 ? (
            <div className="provider-empty">
              <ImagePlus size={40} />
              <h3>Your portfolio is empty</h3>
              <p>
                Add photos of your completed work to show
                customers what you can do.
              </p>
            </div>
          ) : (
            <div className="provider-portfolio-grid">
              {portfolio.map((item) => (
                <article
                  className="provider-portfolio-card"
                  key={item.id}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                  />

                  <div className="provider-portfolio-card-content">
                    <h3>{item.title}</h3>

                    <p>
                      {item.description ||
                        "No description added."}
                    </p>

                    <div className="provider-portfolio-actions">
                      <button
                        type="button"
                        onClick={() =>
                          startPortfolioEdit(item)
                        }
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeletePortfolio(item)
                        }
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ProviderDashboard;
