// frontend/src/components/hangar/HangarForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Box,
  Alert
} from '@mui/material';
import { api } from '../../services/api';

const HangarForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: {
      address: '',
      city: '',
      country: ''
    },
    specifications: {
      size: {
        length: '',
        width: '',
        height: '',
        unit: 'meters'
      }
    },
    basePrice: {
      amount: '',
      currency: 'USD'
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hangars', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add New Hangar
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Hangar Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Address"
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              required
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="City"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                label="Country"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                required
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Length"
                name="specifications.size.length"
                type="number"
                value={formData.specifications.size.length}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                label="Width"
                name="specifications.size.width"
                type="number"
                value={formData.specifications.size.width}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                label="Height"
                name="specifications.size.height"
                type="number"
                value={formData.specifications.size.height}
                onChange={handleChange}
                required
              />
            </Stack>

            <TextField
              fullWidth
              label="Base Price"
              name="basePrice.amount"
              type="number"
              value={formData.basePrice.amount}
              onChange={handleChange}
              InputProps={{
                startAdornment: <Box component="span" sx={{ color: 'text.secondary' }}>$</Box>
              }}
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2 }}
            >
              Add Hangar
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default HangarForm;