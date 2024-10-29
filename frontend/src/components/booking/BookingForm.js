// src/components/booking/BookingForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {api} from '../../services/api';

const BookingForm = ({ type }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState('');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    specialRequirements: ''
  });

  const fetchItem = useCallback(async () => {
    try {
      const endpoint = type === 'hangar' ? '/hangars' : '/services';
      const response = await api.get(`${endpoint}/${id}`);
      setItem(response.data);
    } catch (err) {
      setError('Error fetching details');
    } finally {
      setLoading(false);
    }
  }, [id, type]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotalPrice = useCallback(() => {
    if (!item || !bookingData.startDate || !bookingData.endDate) return 0;
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days * (item.basePrice?.amount || 0);
  }, [item, bookingData.startDate, bookingData.endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingPayload = {
        bookingType: type,
        [type]: id,
        dateRange: {
          startDate: new Date(bookingData.startDate),
          endDate: new Date(bookingData.endDate)
        },
        specialRequirements: bookingData.specialRequirements
      };

      await api.post('/bookings', bookingPayload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating booking');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!item) return <div>Item not found</div>;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Book {item.name}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">
              {type === 'hangar' ? 'Hangar Details' : 'Service Details'}
            </Typography>
            <Typography>Name: {item.name}</Typography>
            {type === 'hangar' && item.location && (
              <Typography>
                Location: {item.location.city}, {item.location.country}
              </Typography>
            )}
            <Typography>
              Base Price: ${item.basePrice?.amount || 0}/{item.basePrice?.currency || 'USD'}
            </Typography>
          </CardContent>
        </Card>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                name="startDate"
                value={bookingData.startDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: today
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                name="endDate"
                value={bookingData.endDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: bookingData.startDate || today
                }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Requirements"
                name="specialRequirements"
                value={bookingData.specialRequirements}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">
                Total Price: ${calculateTotalPrice()}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={!bookingData.startDate || !bookingData.endDate}
              >
                Confirm Booking
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingForm;