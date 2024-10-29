// src/components/service/ServiceCard.js
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Chip,
    Rating
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BookingDialog from '../booking/BookingDialog';

const ServiceCard = ({ service, onBookingComplete }) => {
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
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

    const formatPrice = (pricing) => {
        if (!pricing || !pricing.amount) return 'N/A';
        return `$${pricing.amount} ${pricing.unit ? `per ${pricing.unit}` : ''}`;
    };

    return (
        <>
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="div">
                            {service.name}
                        </Typography>
                        {service.category && (
                            <Chip
                                label={service.category}
                                color="primary"
                                size="small"
                            />
                        )}
                    </Box>

                    <Typography color="text.secondary" paragraph>
                        {service.description}
                    </Typography>

                    {service.rating && (
                        <Box sx={{ my: 2 }}>
                            <Rating 
                                value={service.rating.average || 0} 
                                readOnly 
                                precision={0.5}
                            />
                            <Typography variant="body2" color="text.secondary">
                                ({service.rating.count || 0} reviews)
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" color="primary">
                            {formatPrice(service.pricing)}
                        </Typography>

                        {service.duration && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Duration: {service.duration.estimated} {service.duration.unit}
                            </Typography>
                        )}

                        {service.requirements && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Requirements: {service.requirements}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleBookClick}
                            disabled={service.status === 'unavailable'}
                        >
                            Book Service
                        </Button>
                        
                        {service.status && (
                            <Chip
                                label={service.status}
                                color={service.status === 'available' ? 'success' : 'error'}
                                size="small"
                            />
                        )}
                    </Box>
                </CardContent>
            </Card>

            <BookingDialog
                service={service}
                open={bookingDialogOpen}
                onClose={() => setBookingDialogOpen(false)}
                onBookingComplete={onBookingComplete}
            />
        </>
    );
};

export default ServiceCard;