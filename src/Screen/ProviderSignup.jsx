
import { useState } from "react";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  MenuItem,
  Alert,
} from "@mui/material";

import {
  Person,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  LocationOn,
  Work,
  ArrowForward,
} from "@mui/icons-material";

import { Link as RouterLink } from "react-router-dom";

import { supabase } from "../supabaseClient";
import "./ProviderSignup.css";

const states = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi",
  "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara",
  "Federal Capital Territory",
];

const serviceCategories = [
  "Tech & Digital",
  "Health & Wellness",
  "Skilled Trades",
  "Agriculture & Farming",
  "Home Services",
  "Education & Tutoring",
  "Other Services",
];

function ProviderSignup() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    location: "",
    category: "",
    experience: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName.trim(),
              business_name: formData.businessName.trim(),
              phone: formData.phone.trim(),
              location: formData.location,
              category: formData.category,
              experience: formData.experience,
              role: "provider",
            },
          },
        });

      if (signupError) {
        throw signupError;
      }

      if (data.user && !data.session) {
        setSuccess(
          "Your provider account has been created! Please check your email and confirm your account before logging in."
        );
      } else if (data.user && data.session) {
        setSuccess(
          "Your provider account has been created successfully! You can now log in."
        );
      } else {
        throw new Error(
          "We could not complete your registration. Please try again."
        );
      }

      setFormData({
        fullName: "",
        businessName: "",
        email: "",
        phone: "",
        location: "",
        category: "",
        experience: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="provider-signup-page">
      <Container maxWidth="sm">
        <Paper elevation={0} className="provider-signup-card">

          <Box className="provider-signup-heading">
            <Typography className="provider-signup-label">
              JOIN SERVEHUB
            </Typography>

            <Typography variant="h4">
              Create Your Provider Account
            </Typography>

            <Typography>
              Showcase your skills, connect with customers, and grow your
              service business.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>

            <Typography className="form-section-title">
              Personal & Business Information
            </Typography>

            <TextField
              fullWidth
              required
              name="fullName"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="businessName"
              label="Business Name (Optional)"
              placeholder="Enter your business name"
              value={formData.businessName}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Work />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              required
              type="email"
              name="email"
              label="Email Address"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              required
              type="tel"
              name="phone"
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              required
              select
              name="location"
              label="Your State"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            >
              {states.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              required
              select
              name="category"
              label="Service Category"
              value={formData.category}
              onChange={handleChange}
              margin="normal"
            >
              {serviceCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              required
              select
              name="experience"
              label="Years of Experience"
              value={formData.experience}
              onChange={handleChange}
              margin="normal"
            >
              {[
                "Less than 1 year",
                "1–2 years",
                "3–5 years",
                "6–10 years",
                "More than 10 years",
              ].map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>

            <Typography className="form-section-title password-section">
              Account Security
            </Typography>

            <TextField
              fullWidth
              required
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              helperText="Use at least 8 characters."
              inputProps={{ minLength: 8 }}
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      edge="end"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              required
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              inputProps={{ minLength: 8 }}
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              endIcon={<ArrowForward />}
              className="provider-submit-button"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Provider Account"}
            </Button>

          </Box>

          <Box className="provider-signup-footer">
            <Typography>
              Already have an account?{" "}
              <RouterLink to="/login">Log In</RouterLink>
            </Typography>

            <Typography className="back-link">
              <RouterLink to="/signup">
                Back to account selection
              </RouterLink>
            </Typography>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}

export default ProviderSignup;
