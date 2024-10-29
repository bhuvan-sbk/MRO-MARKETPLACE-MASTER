// frontend/src/components/search/AdvancedSearch.js
import React, { useState } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const AdvancedSearch = ({ onSearch, type }) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    location: '',
    priceRange: [0, 10000],
    category: '',
    availability: '',
    rating: '',
    facilities: [],
    sortBy: 'price_asc'
  });

  const categories = type === 'hangar' 
    ? ['Small', 'Medium', 'Large', 'Extra Large']
    : ['Maintenance', 'Repair', 'Overhaul', 'Inspection', 'Cleaning'];

  const facilities = [
    'Power Supply',
    'Water Supply',
    'Security System',
    'Fire Protection',
    'Climate Control',
    'Maintenance Tools',
    'Storage Area',
    'Office Space'
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (event, newValue) => {
    setFilters(prev => ({
      ...prev,
      priceRange: newValue
    }));
  };

  const handleFacilityToggle = (facility) => {
    setFilters(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      searchTerm: '',
      location: '',
      priceRange: [0, 10000],
      category: '',
      availability: '',
      rating: '',
      facilities: [],
      sortBy: 'price_asc'
    });
    onSearch({});
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Search & Filters</Typography>
        <IconButton onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={filters.location}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      <Collapse in={expanded}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                onChange={handleChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category.toLowerCase()}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleChange}
                label="Sort By"
              >
                <MenuItem value="price_asc">Price: Low to High</MenuItem>
                <MenuItem value="price_desc">Price: High to Low</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>Price Range ($)</Typography>
            <Slider
              value={filters.priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>Facilities</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {facilities.map(facility => (
                <Chip
                  key={facility}
                  label={facility}
                  onClick={() => handleFacilityToggle(facility)}
                  color={filters.facilities.includes(facility) ? "primary" : "default"}
                  clickable
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Collapse>

      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>
    </Paper>
  );
};

export default AdvancedSearch;