// src/components/hangar/HangarList.js
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
    Pagination,
    CircularProgress,
    Alert
} from '@mui/material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const HangarList = () => {
    const [hangars, setHangars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        city: '',
        status: '',
        minPrice: '',
        maxPrice: ''
    });
    const { user } = useAuth();
    const limit = 10;

    useEffect(() => {
        fetchHangars();
    }, [page, filters]);

    const fetchHangars = async () => {
        try {
            setLoading(true);
            setError('');

            // Build query parameters
            const queryParams = new URLSearchParams({
                page,
                limit,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== '')
                )
            });

            const response = await api.get(`/hangars?${queryParams}`);
            
            setHangars(response.data.hangars);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching hangars:', error);
            setError(error.response?.data?.message || 'Failed to fetch hangars');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(1); // Reset to first page when filters change
    };

    const handlePageChange = (event, value) => {
        setPage(value);
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

            {/* Filters */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="City"
                            name="city"
                            value={filters.city}
                            onChange={handleFilterChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Status"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            select
                            SelectProps={{ native: true }}
                        >
                            <option value="">All</option>
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Min Price"
                            name="minPrice"
                            type="number"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Max Price"
                            name="maxPrice"
                            type="number"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Hangar List */}
            <Grid container spacing={3}>
                {hangars.map((hangar) => (
                    <Grid item xs={12} md={6} key={hangar._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                    {hangar.name}
                                </Typography>
                                <Typography color="textSecondary">
                                    {hangar.location.city}
                                </Typography>
                                <Typography>
                                    Size: {hangar.size}
                                </Typography>
                                <Typography>
                                    Price: ${hangar.pricePerDay}/day
                                </Typography>
                                <Typography>
                                    Status: {hangar.status}
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Button 
                                        variant="contained" 
                                        color="primary"
                                        href={`/hangars/${hangar._id}`}
                                    >
                                        View Details
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={handlePageChange} 
                        color="primary" 
                    />
                </Box>
            )}
        </Container>
    );
};

export default HangarList;