// src/components/booking/BookingDialog.js
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Alert,
    Box
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { api } from '../../services/api';

const BookingDialog = ({ service, open, onClose, onBookingComplete }) => {
    const [bookingData, setBookingData] = useState({
        startDate: null,
        endDate: null,
        requirements: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setBookingData({
                startDate: null,
                endDate: null,
                requirements: ''
            });
            setError('');
        }
    }, [open]);

    const handleDateChange = (field) => (newValue) => {
        try {
            const date = newValue ? dayjs(newValue).toDate() : null;
            setBookingData(prev => ({
                ...prev,
                [field]: date,
                // Reset end date if start date is after it
                ...(field === 'startDate' && prev.endDate && date > prev.endDate 
                    ? { endDate: null } 
                    : {})
            }));
        } catch (err) {
            console.error('Date conversion error:', err);
            setError('Invalid date selection');
        }
    };

    const handleRequirementsChange = (e) => {
        setBookingData(prev => ({
            ...prev,
            requirements: e.target.value
        }));
    };

    const validateBooking = () => {
        if (!bookingData.startDate || !bookingData.endDate) {
            setError('Please select both start and end dates');
            return false;
        }

        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        
        if (start >= end) {
            setError('End date must be after start date');
            return false;
        }

        if (start < new Date()) {
            setError('Start date cannot be in the past');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        try {
            if (!validateBooking()) {
                return;
            }

            setLoading(true);
            setError('');

            const response = await api.post('/bookings', {
                serviceId: service?._id,
                startDate: bookingData.startDate.toISOString(),
                endDate: bookingData.endDate.toISOString(),
                requirements: bookingData.requirements || ''
            });

            onBookingComplete?.(response.data);
            handleClose();
        } catch (error) {
            console.error('Booking error:', error);
            setError(error.response?.data?.message || 'Failed to create booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setBookingData({
            startDate: null,
            endDate: null,
            requirements: ''
        });
        setError('');
        onClose();
    };

    const calculateDuration = () => {
        if (!bookingData.startDate || !bookingData.endDate) {
            return 0;
        }
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60)));
    };

    const calculateEstimatedPrice = () => {
        const duration = calculateDuration();
        if (!duration || !service?.pricing?.amount) {
            return 0;
        }
        return (duration * service.pricing.amount).toFixed(2);
    };

    if (!service) return null;

    const duration = calculateDuration();

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Book Service: {service.name}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <DateTimePicker
                            label="Start Date & Time"
                            value={bookingData.startDate ? dayjs(bookingData.startDate) : null}
                            onChange={handleDateChange('startDate')}
                            minDateTime={dayjs()}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    variant: 'outlined',
                                    error: !!error && !bookingData.startDate
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DateTimePicker
                            label="End Date & Time"
                            value={bookingData.endDate ? dayjs(bookingData.endDate) : null}
                            onChange={handleDateChange('endDate')}
                            minDateTime={bookingData.startDate ? dayjs(bookingData.startDate) : dayjs()}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    variant: 'outlined',
                                    error: !!error && !bookingData.endDate
                                }
                            }}
                            disabled={!bookingData.startDate}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Special Requirements"
                            value={bookingData.requirements}
                            onChange={handleRequirementsChange}
                            placeholder="Enter any special requirements or notes for the service"
                        />
                    </Grid>

                    {duration > 0 && (
                        <Grid item xs={12}>
                            <Box sx={{ 
                                p: 2, 
                                bgcolor: 'background.default',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <Typography variant="h6" gutterBottom>
                                    Booking Summary
                                </Typography>
                                <Typography>
                                    Duration: {duration} hours
                                </Typography>
                                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                    Estimated Price: ${calculateEstimatedPrice()}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading || !bookingData.startDate || !bookingData.endDate}
                >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BookingDialog;