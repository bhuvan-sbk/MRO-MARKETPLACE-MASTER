// src/components/services/ServiceCard.js
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Alert,
    Chip,
    Box,
    Rating
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Ensure this path is correct
import { api } from '../../services/api';

const ServiceCard = ({ service, onBookingComplete }) => {
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [bookingData, setBookingData] = useState({
        startDate: null,
        endDate: null,
        requirements: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleBookClick = () => {
        if (!user) {
            navigate('/login', { 
                state: { from: `/services/${service._id}` }
            });
            return;
        }
        setBookingDialogOpen(true);
    };

    const handleInputChange = (field) => (value) => {
        setBookingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.post('/api/service-bookings', {
                serviceId: service._id,
                ...bookingData
            });

            if (onBookingComplete) {
                onBookingComplete(response.data);
            }
            setBookingDialogOpen(false);
            setBookingData({
                startDate: null,
                endDate: null,
                requirements: ''
            });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const calculateEstimatedPrice = () => {
        if (!bookingData.startDate || !bookingData.endDate || !service.pricePerHour) {
            return 0;
        }
        const hours = Math.ceil(
            (new Date(bookingData.endDate) - new Date(bookingData.startDate)) / 
            (1000 * 60 * 60)
        );
        return (hours * service.pricePerHour).toFixed(2);
    };

    return (
        <>
            <Card>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                        {service.name}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Chip 
                            label={service.category} 
                            color="primary" 
                            size="small" 
                        />
                    </Box>

                    <Typography color="textSecondary" gutterBottom>
                        {service.description}
                    </Typography>

                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Rating value={service.rating?.average || 0} readOnly />
                        <Typography variant="body2" color="textSecondary">
                            ({service.rating?.count || 0} reviews)
                        </Typography>
                    </Box>

                    <Typography variant="h6" sx={{ mt: 2 }}>
                        ${service.pricePerHour} per hour
                    </Typography>

                    {service.duration && (
                        <Typography variant="body2" color="textSecondary">
                            Estimated duration: {service.duration.estimated} {service.duration.unit}
                        </Typography>
                    )}
                </CardContent>

                <CardActions>
                    <Button 
                        size="large" 
                        variant="contained" 
                        fullWidth
                        onClick={handleBookClick}
                    >
                        Book Service
                    </Button>
                </CardActions>
            </Card>

            <Dialog 
                open={bookingDialogOpen} 
                onClose={() => setBookingDialogOpen(false)}
                maxWidth="sm" 
                fullWidth
            >
                <DialogTitle>Book Service: {service?.name}</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Grid item xs={12} sm={6}>
                                <DateTimePicker
                                    label="Start Date & Time"
                                    value={bookingData.startDate}
                                    onChange={handleInputChange('startDate')}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    minDate={new Date()}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DateTimePicker
                                    label="End Date & Time"
                                    value={bookingData.endDate}
                                    onChange={handleInputChange('endDate')}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    minDate={bookingData.startDate || new Date()}
                                />
                            </Grid>
                        </LocalizationProvider>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Special Requirements"
                                value={bookingData.requirements}
                                onChange={(e) => handleInputChange('requirements')(e.target.value)}
                            />
                        </Grid>

                        {bookingData.startDate && bookingData.endDate && (
                            <Grid item xs={12}>
                                <Box sx={{ 
                                    p: 2, 
                                    bgcolor: 'background.default',
                                    borderRadius: 1
                                }}>
                                    <Typography variant="h6" gutterBottom>
                                        Booking Summary
                                    </Typography>
                                    <Typography>
                                        Duration: {
                                            Math.ceil(
                                                (new Date(bookingData.endDate) - new Date(bookingData.startDate)) / 
                                                (1000 * 60 * 60)
                                            )
                                        } hours
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        Estimated Price: ${calculateEstimatedPrice()}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setBookingDialogOpen(false)}
                        disabled={loading}
                    >
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
        </>
    );
};

export default ServiceCard;