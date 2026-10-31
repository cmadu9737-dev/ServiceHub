
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
  ArrowForward,
} from "@mui/icons-material";

import { Link as RouterLink } from "react-router-dom";

import { supabase } from "../supabaseClient";

import "./CustomerSignup.css";

function CustomerSignup() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
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

    try {
      setLoading(true);

      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            phone: formData.phone.trim(),
            location: formData.location,
            role: "customer",
          },
        },
      });

      if (signupError) {
        throw signupError;
      }

      if (data.session) {
        setSuccess(
          "Your customer account has been created successfully!"
        );
      } else {
        setSuccess(
          "Registration successful! Please check your email to confirm your account before logging in."
        );
      }

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        location: "",
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
    <Box className="customer-signup-page">
      <Container maxWidth="sm">
        <Paper elevation={0} className="customer-signup-card">

          {/* PAGE HEADING */}
          <Box className="customer-signup-heading">
            <Typography className="customer-signup-label">
              JOIN SERVEHUB
            </Typography>

            <Typography variant="h4">
              Create Your Customer Account
            </Typography>

            <Typography>
              Find trusted professionals and get the services you need.
            </Typography>
          </Box>

          {/* REGISTRATION FORM */}
          <Box component="form" onSubmit={handleSubmit}>

            <Typography className="form-section-title">
              Personal Information
            </Typography>

            {/* FULL NAME */}
            <TextField
              fullWidth
              required
              name="fullName"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              margin="normal"
              autoComplete="name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />

            {/* EMAIL */}
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

            {/* PHONE NUMBER */}
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
              autoComplete="tel"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />

            {/* LOCATION */}
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
              {[
                "Abia",
                "Adamawa",
                "Akwa Ibom",
                "Anambra",
                "Bauchi",
                "Bayelsa",
                "Benue",
                "Borno",
                "Cross River",
                "Delta",
                "Ebonyi",
                "Edo",
                "Ekiti",
                "Enugu",
                "Gombe",
                "Imo",
                "Jigawa",
                "Kaduna",
                "Kano",
                "Katsina",
                "Kebbi",
                "Kogi",
                "Kwara",
                "Lagos",
                "Nasarawa",
                "Niger",
                "Ogun",
                "Ondo",
                "Osun",
                "Oyo",
                "Plateau",
                "Rivers",
                "Sokoto",
                "Taraba",
                "Yobe",
                "Zamfara",
                "Federal Capital Territory",
              ].map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>

            {/* ACCOUNT SECURITY */}
            <Typography className="form-section-title password-section">
              Account Security
            </Typography>

            {/* PASSWORD */}
            <TextField
              fullWidth
              required
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              autoComplete="new-password"
              helperText="Use at least 8 characters."
              inputProps={{ minLength: 8 }}
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

            {/* CONFIRM PASSWORD */}
            <TextField
              fullWidth
              required
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              autoComplete="new-password"
              inputProps={{ minLength: 8 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
            />

            {/* FORM FEEDBACK */}
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

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              endIcon={<ArrowForward />}
              className="customer-submit-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Customer Account"}
            </Button>

          </Box>

          {/* FOOTER */}
          <Box className="customer-signup-footer">
            <Typography>
              Already have an account?{" "}
              <RouterLink to="/login">
                Log In
              </RouterLink>
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

export default CustomerSignup;
