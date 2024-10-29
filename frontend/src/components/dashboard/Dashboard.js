import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import BookingManagement from '../booking/BookingManagement';
import ReviewList from '../review/ReviewList';
import { api } from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    averageRating: 0,
    recentBookings: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/metrics');
      setMetrics({
        totalBookings: response.data.totalBookings || 0,
        pendingBookings: response.data.pendingBookings || 0,
        completedBookings: response.data.completedBookings || 0,
        averageRating: response.data.averageRating || 0,
        recentBookings: response.data.recentBookings || []
      });
      setError('');
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err.response?.data?.message || 'Error fetching dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ value, label, type = 'number' }) => (
    <Box flex={1} minWidth={240} p={1}>
      <Paper 
        sx={{ 
          p: 2, 
          textAlign: 'center',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h6">
          {loading ? <CircularProgress size={20} /> : 
           type === 'rating' ? Number(value).toFixed(1) : value}
        </Typography>
        <Typography color="text.secondary">{label}</Typography>
      </Paper>
    </Box>
  );

  const tabs = [
    { label: 'Bookings', component: <BookingManagement userType={user?.role} /> },
    { label: 'Reviews', component: <ReviewList /> },
    { label: 'Account Settings', component: <Typography>Account settings content</Typography> }
  ];

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">Please log in to view the dashboard</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name || 'User'}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {user.role === 'admin' ? 'Admin Dashboard' : 'Customer Dashboard'}
        </Typography>
      </Box>

      {/* Metrics Summary */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 4 
        }}
      >
        <MetricCard 
          value={metrics.totalBookings}
          label="Total Bookings"
        />
        <MetricCard 
          value={metrics.pendingBookings}
          label="Pending Bookings"
        />
        <MetricCard 
          value={metrics.completedBookings}
          label="Completed Bookings"
        />
        <MetricCard 
          value={metrics.averageRating}
          label="Average Rating"
          type="rating"
        />
      </Box>

      {/* Main Content */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab key={tab.label} label={tab.label} />
          ))}
        </Tabs>

        {tabs.map((tab, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Paper>

      {/* Refresh Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          onClick={fetchMetrics}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;