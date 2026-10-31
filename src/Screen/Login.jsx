
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
} from "@mui/material";

import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowForward,
} from "@mui/icons-material";

import { supabase } from "../supabaseClient";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Authenticate the user
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;

      // Retrieve the user's account role
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

      if (profileError) throw profileError;

      // Redirect according to account type
      if (profile.role === "customer") {
        navigate("/customer-dashboard", { replace: true });
      } else if (profile.role === "provider") {
        navigate("/provider-dashboard", { replace: true });
      } else {
        throw new Error("Your account role could not be identified.");
      }
    } catch (err) {
      setError(
        err.message || "Login failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-page">
      <Container maxWidth="sm">
        <Paper elevation={0} className="login-card">

          <Box className="login-heading">
            <Typography className="login-label">
              WELCOME BACK TO SERVEHUB
            </Typography>

            <Typography variant="h4">
              Log In to Your Account
            </Typography>

            <Typography>
              Access your ServeHub account and continue where you left off.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Typography className="form-section-title">
              Account Information
            </Typography>

            <TextField
              fullWidth
              required
              type="email"
              label="Email Address"
              placeholder="example@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              margin="normal"
              autoComplete="current-password"
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

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              endIcon={<ArrowForward />}
              className="login-submit-button"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </Button>
          </Box>

          <Box className="login-footer">
            <Typography>
              Don't have an account?{" "}
              <RouterLink to="/signup">
                Create an Account
              </RouterLink>
            </Typography>

            <Typography className="back-link">
              <RouterLink to="/">
                Back to Home
              </RouterLink>
            </Typography>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
