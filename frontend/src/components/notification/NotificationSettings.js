// frontend/src/components/notifications/NotificationSettings.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Switch,
  FormGroup,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  Grid,
  TextField,
  Chip
} from '@mui/material';
import api from '../../services/api';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email: {
      bookings: true,
      payments: true,
      reviews: true,
      reports: true,
      system: true
    },
    frequency: 'instant', // instant, daily, weekly
    emailAddresses: [],
    customTemplates: {}
  });
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/notifications/settings');
      setSettings(response.data);
    } catch (err) {
      setError('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (type) => {
    try {
      const updatedSettings = {
        ...settings,
        email: {
          ...settings.email,
          [type]: !settings.email[type]
        }
      };

      await api.put('/notifications/settings', updatedSettings);
      setSettings(updatedSettings);
      setSuccess('Settings updated successfully');
    } catch (err) {
      setError('Failed to update settings');
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail || settings.emailAddresses.includes(newEmail)) return;

    try {
      const updatedSettings = {
        ...settings,
        emailAddresses: [...settings.emailAddresses, newEmail]
      };

      await api.put('/notifications/settings', updatedSettings);
      setSettings(updatedSettings);
      setNewEmail('');
      setSuccess('Email added successfully');
    } catch (err) {
      setError('Failed to add email');
    }
  };

  const handleRemoveEmail = async (email) => {
    try {
      const updatedSettings = {
        ...settings,
        emailAddresses: settings.emailAddresses.filter(e => e !== email)
      };

      await api.put('/notifications/settings', updatedSettings);
      setSettings(updatedSettings);
      setSuccess('Email removed successfully');
    } catch (err) {
      setError('Failed to remove email');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Notification Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Email Notifications
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email.bookings}
                  onChange={() => handleToggle('bookings')}
                />
              }
              label="Booking Updates"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email.payments}
                  onChange={() => handleToggle('payments')}
                />
              }
              label="Payment Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email.reviews}
                  onChange={() => handleToggle('reviews')}
                />
              }
              label="New Reviews"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email.reports}
                  onChange={() => handleToggle('reports')}
                />
              }
              label="Report Generation"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email.system}
                  onChange={() => handleToggle('system')}
                />
              }
              label="System Updates"
            />
          </FormGroup>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Notification Recipients
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Add Email Address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={handleAddEmail}
                fullWidth
                sx={{ height: '100%' }}
              >
                Add Email
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {settings.emailAddresses.map((email) => (
              <Chip
                key={email}
                label={email}
                onDelete={() => handleRemoveEmail(email)}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Notification Frequency
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.frequency === 'instant'}
                  onChange={() => handleToggle('frequency')}
                />
              }
              label="Send notifications immediately"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.frequency === 'daily'}
                  onChange={() => handleToggle('frequency')}
                />
              }
              label="Daily digest"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.frequency === 'weekly'}
                  onChange={() => handleToggle('frequency')}
                />
              }
              label="Weekly summary"
            />
          </FormGroup>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotificationSettings;