import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";

import {
  Search,
  Handshake,
  VerifiedUser,
  Groups,
  TrendingUp,
  ArrowForward,
} from "@mui/icons-material";

import { Link as RouterLink } from "react-router-dom";
import "./BecomeMember.css";

function BecomeMember() {
  return (
    <Box className="member-page">
      {/* HERO SECTION */}
      <Box className="member-hero">
        <Container maxWidth="lg">
          <Typography className="member-label">
            JOIN THE SERVEHUB COMMUNITY
          </Typography>

          <Typography variant="h2" className="member-title">
            Become a Member of{" "}
            <span>ServeHub</span>
          </Typography>

          <Typography className="member-description">
            Whether you need a reliable professional or want to grow
            your service business, ServeHub brings people together.
            Find trusted experts, showcase your skills, and connect
            with opportunities in your community.
          </Typography>

          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            endIcon={<ArrowForward />}
            className="member-main-button"
          >
            Join ServeHub Today
          </Button>
        </Container>
      </Box>

      {/* BENEFITS SECTION */}
      <Container maxWidth="lg" className="member-content">
        <Box className="member-section-heading">
          <Typography variant="h4">
            Why Join ServeHub?
          </Typography>

          <Typography>
            A simple way to find services or grow your professional
            opportunities.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card className="benefit-card">
              <CardContent>
                <Search className="benefit-icon" />
                <Typography variant="h6">
                  Find Local Experts
                </Typography>
                <Typography>
                  Discover professionals for your everyday service needs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card className="benefit-card">
              <CardContent>
                <VerifiedUser className="benefit-icon" />
                <Typography variant="h6">
                  Connect with Confidence
                </Typography>
                <Typography>
                  Find the right professionals for the services you need.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card className="benefit-card">
              <CardContent>
                <TrendingUp className="benefit-icon" />
                <Typography variant="h6">
                  Grow Your Business
                </Typography>
                <Typography>
                  Give your skills more visibility and reach potential customers.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ACCOUNT TYPE SECTION */}
        <Box className="member-section-heading account-heading">
          <Typography variant="h4">
            How Would You Like to Join?
          </Typography>

          <Typography>
            Choose the membership that suits your needs.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* CUSTOMER CARD */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card className="account-card">
              <CardContent>
                <Box className="account-icon customer-icon">
                  <Search />
                </Box>

                <Typography variant="h5">
                  I Need a Service
                </Typography>

                <Typography className="account-description">
                  Looking for reliable professionals? Join as a customer
                  and discover skilled experts in your area.
                </Typography>

                <Box className="account-features">
                  <Typography>✓ Find local service professionals</Typography>
                  <Typography>✓ Explore different service categories</Typography>
                  <Typography>✓ Connect with professionals</Typography>
                </Box>

                <Button
                  component={RouterLink}
                  to="/signup/customer"
                  variant="contained"
                  fullWidth
                  endIcon={<ArrowForward />}
                  className="account-button"
                >
                  Join as a Customer
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* PROVIDER CARD */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card className="account-card provider-card">
              <CardContent>
                <Box className="account-icon provider-icon">
                  <Handshake />
                </Box>

                <Typography variant="h5">
                  I Provide a Service
                </Typography>

                <Typography className="account-description">
                  Are you a skilled professional? Join as a provider,
                  showcase your services, and connect with potential customers.
                </Typography>

                <Box className="account-features">
                  <Typography>✓ Showcase your skills and experience</Typography>
                  <Typography>✓ Reach potential customers</Typography>
                  <Typography>✓ Build your professional presence</Typography>
                </Box>

                <Button
                  component={RouterLink}
                  to="/signup/provider"
                  variant="contained"
                  fullWidth
                  endIcon={<ArrowForward />}
                  className="account-button"
                >
                  Join as a Provider
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* BOTTOM SECTION */}
        <Box className="member-bottom">
          <Groups className="bottom-icon" />

          <Typography variant="h4">
            Your Community. Your Opportunities.
          </Typography>

          <Typography>
            Become part of a growing community built around skills,
            services, and meaningful connections.
          </Typography>

          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            className="member-main-button"
          >
            Get Started
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default BecomeMember;