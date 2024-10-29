// src/components/service/ServiceList.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Box,
  TextField,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ServiceCard from './ServiceCard'; // Import ServiceCard component

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: '',
    sortBy: 'name'
  });
  const [successMessage, setSuccessMessage] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.priceRange) params.append('priceRange', filters.priceRange);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const response = await api.get(`/services?${params}`);
      if (response.data && Array.isArray(response.data)) {
        setServices(response.data);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleBookingComplete = (bookingData) => {
    setSuccessMessage('Service booked successfully!');
    fetchServices(); // Refresh the list after booking
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Available Services
      </Typography>

      {/* Filters Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search services..."
              value={filters.search}
              onChange={handleFilterChange('search')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Category"
              value={filters.category}
              onChange={handleFilterChange('category')}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="repair">Repair</MenuItem>
              <MenuItem value="inspection">Inspection</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Price Range"
              value={filters.priceRange}
              onChange={handleFilterChange('priceRange')}
            >
              <MenuItem value="">All Prices</MenuItem>
              <MenuItem value="low">$0 - $100</MenuItem>
              <MenuItem value="medium">$101 - $500</MenuItem>
              <MenuItem value="high">$501+</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              select
              label="Sort By"
              value={filters.sortBy}
              onChange={handleFilterChange('sortBy')}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} md={6} key={service._id}>
            <ServiceCard
              service={service}
              onBookingComplete={handleBookingComplete}
              formatPrice={(pricing) => {
                if (!pricing || !pricing.amount) return 'N/A';
                const amount = Number(pricing.amount).toFixed(2);
                const unit = pricing.unit ? ` per ${pricing.unit}` : '';
                return `$${amount}${unit}`;
              }}
              formatDuration={(duration) => {
                if (!duration) return 'N/A';
                if (typeof duration === 'object') {
                  const value = duration.value || '';
                  const unit = duration.unit || '';
                  return `${value} ${unit}`.trim() || 'N/A';
                }
                return String(duration);
              }}
              formatAvailability={(availability) => {
                if (!availability) return 'N/A';
                if (typeof availability === 'object') {
                  const days = availability.days || '';
                  const hours = availability.hours || '';
                  return `${days} ${hours}`.trim() || 'N/A';
                }
                return String(availability);
              }}
            />
          </Grid>
        ))}
      </Grid>

      {services.length === 0 && !loading && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No services match your criteria.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ServiceList;