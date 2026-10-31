
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from "@mui/material";

import {
  Search,
  Handshake,
  ArrowForward,
  VerifiedUser,
  Storefront,
} from "@mui/icons-material";

import { Link as RouterLink } from "react-router-dom";
import "./Signup.css";

function Signup() {
  return (
    <Box className="signup-page">
      <Container maxWidth="lg">
        <Box className="signup-header">
          <Typography className="signup-eyebrow">
            WELCOME TO SERVEHUB
          </Typography>

          <Typography variant="h3" className="signup-title">
            Create Your Account
          </Typography>

          <Typography className="signup-subtitle">
            Join a community that connects people with trusted
            professionals. Choose how you would like to use ServeHub.
          </Typography>
        </Box>

        <Box className="signup-cards">
          <Card className="signup-card">
            <CardContent>
              <Box className="signup-icon customer-signup-icon">
                <Search />
              </Box>

              <Typography variant="h5" className="signup-card-title">
                I Need a Service
              </Typography>

              <Typography className="signup-card-description">
                Find reliable professionals for your everyday needs.
                Explore services, discover skilled experts, and connect
                with the right people.
              </Typography>

              <Box className="signup-benefits">
                <Typography>
                  <VerifiedUser /> Find trusted professionals
                </Typography>
                <Typography>
                  <Search /> Explore service categories
                </Typography>
                <Typography>
                  <Handshake /> Connect with service providers
                </Typography>
              </Box>

              <Button
                component={RouterLink}
                to="/signup/customer"
                variant="contained"
                fullWidth
                endIcon={<ArrowForward />}
                className="signup-button"
              >
                Sign Up as a Customer
              </Button>
            </CardContent>
          </Card>

          <Card className="signup-card provider-signup-card">
            <CardContent>
              <Box className="signup-icon provider-signup-icon">
                <Storefront />
              </Box>

              <Typography variant="h5" className="signup-card-title">
                I Provide a Service
              </Typography>

              <Typography className="signup-card-description">
                Showcase your skills, promote your services, and connect
                with customers looking for professionals like you.
              </Typography>

              <Box className="signup-benefits">
                <Typography>
                  <VerifiedUser /> Build your professional profile
                </Typography>
                <Typography>
                  <Storefront /> Showcase your services
                </Typography>
                <Typography>
                  <Handshake /> Reach potential customers
                </Typography>
              </Box>

              <Button
                component={RouterLink}
                to="/signup/provider"
                variant="contained"
                fullWidth
                endIcon={<ArrowForward />}
                className="signup-button"
              >
                Sign Up as a Provider
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Box className="signup-footer">
          <Typography>
            Already have an account?
            {" "}
            <RouterLink to="/login">Log In</RouterLink>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Signup;
