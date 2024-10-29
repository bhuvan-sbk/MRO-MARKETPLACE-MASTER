// frontend/src/components/notifications/EmailPreferences.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import api from '../../services/api';

const EmailPreferences = () => {
  const [preferences, setPreferences] = useState({
    newBooking: true,
    bookingUpdates: true,
    paymentConfirmations: true,
    reviews: true,
    promotions: false,
    reportSummaries: true,
    securityAlerts: true
  });

  const [customSchedule, setCustomSchedule] = useState({
    enabled: false,
    frequency: 'daily',
    time: '09:00'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data.preferences);
      setCustomSchedule(response.data.customSchedule);
    } catch (err) {
      setError('Error loading preferences');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key) => {
    try {
      await api.patch('/notifications/preferences', {
        [key]: !preferences[key]
      });
      setPreferences(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
      setSuccess('Preferences updated successfully');
    } catch (err) {
      setError('Error updating preferences');
    }
  };

  const handleScheduleUpdate = async () => {
    try {
      await api.patch('/notifications/schedule', customSchedule);
      setSuccess('Schedule updated successfully');
      setDialogOpen(false);
    } catch (err) {
      setError('Error updating schedule');
    }
  };

  const notifications = [
    {
      key: 'newBooking',
      label: 'New Booking Notifications',
      description: 'Receive emails when new bookings are made'
    },
    {
      key: 'bookingUpdates',
      label: 'Booking Updates',
      description: 'Get notified about changes to existing bookings'
    },
    {
      key: 'paymentConfirmations',
      label: 'Payment Confirmations',
      description: 'Receive payment receipts and confirmations'
    },
    {
      key: 'reviews',
      label: 'Reviews & Ratings',
      description: 'Get notified when new reviews are posted'
    },
    {
      key: 'promotions',
      label: 'Promotional Updates',
      description: 'Receive marketing and promotional emails'
    },
    {
      key: 'reportSummaries',
      label: 'Report Summaries',
      description: 'Receive periodic business performance reports'
    },
    {
      key: 'securityAlerts',
      label: 'Security Alerts',
      description: 'Get notified about security-related activities'
    }
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Email Notification Preferences
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

      <List>
        {notifications.map((notification, index) => (
          <React.Fragment key={notification.key}>
            <ListItem>
              <ListItemText
                primary={notification.label}
                secondary={notification.description}
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={preferences[notification.key]}
                  onChange={() => handlePreferenceChange(notification.key)}
                />
              </ListItemSecondaryAction>
            </ListItem>
            {index < notifications.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => setDialogOpen(true)}
        >
          Configure Custom Schedule
        </Button>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Custom Notification Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={customSchedule.frequency}
                onChange={(e) => setCustomSchedule(prev => ({
                  ...prev,
                  frequency: e.target.value
                }))}
                label="Frequency"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Preferred Time"
              type="time"
              value={customSchedule.time}
              onChange={(e) => setCustomSchedule(prev => ({
                ...prev,
                time: e.target.value
              }))}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleScheduleUpdate} variant="contained">
            Save Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EmailPreferences;