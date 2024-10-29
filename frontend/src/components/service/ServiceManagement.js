// src/components/services/ServiceManagement.js
import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Box,
    MenuItem,
    Alert,
    CircularProgress
} from '@mui/material';
import { api } from '../../services/api';

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newService, setNewService] = useState({
        name: '',
        description: '',
        category: '',
        pricing: {
            amount: '',
            unit: 'per_hour'
        }
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/services');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
            setError('Failed to fetch services');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('pricing.')) {
            const pricingField = name.split('.')[1];
            setNewService(prev => ({
                ...prev,
                pricing: {
                    ...prev.pricing,
                    [pricingField]: value
                }
            }));
        } else {
            setNewService(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/services', newService);
            fetchServices();
            setNewService({
                name: '',
                description: '',
                category: '',
                pricing: {
                    amount: '',
                    unit: 'per_hour'
                }
            });
        } catch (error) {
            setError('Failed to create service');
        }
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
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Add New Service Form */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Add New Service
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Service Name"
                                    name="name"
                                    value={newService.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Category"
                                    name="category"
                                    value={newService.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                                    <MenuItem value="Repair">Repair</MenuItem>
                                    <MenuItem value="Overhaul">Overhaul</MenuItem>
                                    <MenuItem value="Inspection">Inspection</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Description"
                                    name="description"
                                    value={newService.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Price"
                                    name="pricing.amount"
                                    value={newService.pricing.amount}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Pricing Unit"
                                    name="pricing.unit"
                                    value={newService.pricing.unit}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <MenuItem value="per_hour">Per Hour</MenuItem>
                                    <MenuItem value="per_day">Per Day</MenuItem>
                                    <MenuItem value="fixed">Fixed Price</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                >
                                    Add Service
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            {/* Services List */}
            <Typography variant="h5" gutterBottom>
                Your Services
            </Typography>
            <Grid container spacing={3}>
                {services.map((service) => (
                    <Grid item xs={12} md={6} key={service._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                    {service.name}
                                </Typography>
                                <Typography color="textSecondary">
                                    {service.category}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {service.description}
                                </Typography>
                                <Typography sx={{ mt: 1 }}>
                                    Price: ${service.pricing.amount} / {service.pricing.unit.replace('_', ' ')}
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        href={`/services/${service._id}`}
                                    >
                                        View Details
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default ServiceManagement;