// frontend/src/components/booking/BookingManagement.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { api } from '../../services/api';

const BookingManagement = ({ userType = 'customer' }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [userType]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const endpoint = `bookings/${userType === 'provider' ? 'provider' : 'customer'}`;
      const response = await api.get(endpoint);
      
      if (response.data) {
        setBookings(response.data);
      } else {
        setBookings([]);
        setError('No bookings data received');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Error fetching bookings. Please try again later.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (booking, action) => {
    setSelectedBooking(booking);
    setActionType(action);
    setActionReason('');
    setDialogOpen(true);
  };

  const submitAction = async () => {
    if (!actionReason.trim()) {
      setError('Please provide a reason for this action');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      
      const endpoint = `/bookings/${selectedBooking._id}/${actionType}`;
      await api.post(endpoint, { 
        reason: actionReason,
        bookingId: selectedBooking._id
      });

      await fetchBookings(); // Refresh the bookings list
      setDialogOpen(false);
      setActionReason('');
    } catch (err) {
      console.error(`Error ${actionType}ing booking:`, err);
      setError(err.response?.data?.message || `Failed to ${actionType} booking. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            No bookings found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>{userType === 'provider' ? 'Customer' : 'Provider'}</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking._id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell>
                    {userType === 'provider' 
                      ? booking.customer?.companyName || 'N/A'
                      : booking.provider?.companyName || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {booking.bookingType
                      ? booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{formatDate(booking.dateRange?.startDate)}</TableCell>
                  <TableCell>{formatDate(booking.dateRange?.endDate)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={booking.status || 'Unknown'}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleAction(booking, 'confirm')}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleAction(booking, 'cancel')}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleAction(booking, 'complete')}
                        >
                          Complete
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog 
        open={dialogOpen} 
        onClose={() => !actionLoading && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType.charAt(0).toUpperCase() + actionType.slice(1)} Booking
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            margin="normal"
            disabled={actionLoading}
            required
            error={!actionReason.trim()}
            helperText={!actionReason.trim() ? 'Reason is required' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={submitAction} 
            color="primary"
            variant="contained"
            disabled={actionLoading || !actionReason.trim()}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingManagement;