// src/components/services/ServiceDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import { api } from '../../services/api';
import ServiceBooking from './ServiceBooking';

const ServiceDetails = () => {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

    useEffect(() => {
        fetchService();
    }, [id]);

    const fetchService = async () => {
        try {
            const response = await api.get(`/services/${id}`);
            setService(response.data);
        } catch (error) {
            setError('Failed to fetch service details');
        } finally {
            setLoading(false);
        }
    };

    const handleBookingComplete = () => {
        // Handle successful booking
        setBookingDialogOpen(false);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!service) return <Alert severity="info">Service not found</Alert>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Card>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h4" gutterBottom>
                                {service.name}
                            </Typography>
                            <Typography color="textSecondary" gutterBottom>
                                Category: {service.category}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {service.description}
                            </Typography>
                            
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Specifications
                                </Typography>
                                {service.specifications?.map((spec, index) => (
                                    <Chip
                                        key={index}
                                        label={`${spec.key}: ${spec.value}`}
                                        sx={{ mr: 1, mb: 1 }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Pricing
                                    </Typography>
                                    <Typography variant="h4" color="primary">
                                        ${service.pricing.amount}
                                        <Typography variant="caption" sx={{ ml: 1 }}>
                                            /{service.pricing.unit.replace('_', ' ')}
                                        </Typography>
                                    </Typography>
                                    
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        onClick={() => setBookingDialogOpen(true)}
                                    >
                                        Book Now
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <ServiceBooking
                service={service}
                open={bookingDialogOpen}
                onClose={() => setBookingDialogOpen(false)}
                onBookingComplete={handleBookingComplete}
            />
        </Container>
    );
};

export default ServiceDetails;