// frontend/src/components/dashboard/RealTimeUpdates.js
import React, { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Typography,
  Box,
  Chip
} from '@mui/material';
import {
  AccountCircle,
  EventAvailable,
  Payment,
  Star
} from '@mui/icons-material';
import wsService from '../../services/websocket';

const RealTimeUpdates = () => {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    // Subscribe to different types of updates
    const unsubscribeBooking = wsService.subscribe('booking', (data) => {
      addUpdate('booking', data);
    });

    const unsubscribePayment = wsService.subscribe('payment', (data) => {
      addUpdate('payment', data);
    });

    const unsubscribeReview = wsService.subscribe('review', (data) => {
      addUpdate('review', data);
    });

    return () => {
      unsubscribeBooking();
      unsubscribePayment();
      unsubscribeReview();
    };
  }, []);

  const addUpdate = (type, data) => {
    setUpdates(prev => [{
      id: Date.now(),
      type,
      data,
      timestamp: new Date()
    }, ...prev].slice(0, 10)); // Keep only last 10 updates
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return <EventAvailable color="primary" />;
      case 'payment':
        return <Payment color="success" />;
      case 'review':
        return <Star color="warning" />;
      default:
        return <AccountCircle />;
    }
  };

  const getUpdateMessage = (update) => {
    switch (update.type) {
      case 'booking':
        return `New booking received for ${update.data.serviceName}`;
      case 'payment':
        return `Payment of $${update.data.amount} received`;
      case 'review':
        return `New ${update.data.rating}★ review received`;
      default:
        return 'Update received';
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Real-time Updates</Typography>
        <Chip 
          label="Live" 
          color="success" 
          size="small"
          sx={{ '& .MuiChip-label': { px: 1 } }}
        />
      </Box>
      
      {updates.length === 0 ? (
        <Typography color="textSecondary" align="center">
          No recent updates
        </Typography>
      ) : (
        <List>
          {updates.map((update) => (
            <ListItem key={update.id}>
              <ListItemIcon>
                {getIcon(update.type)}
              </ListItemIcon>
              <ListItemText
                primary={getUpdateMessage(update)}
                secondary={new Date(update.timestamp).toLocaleTimeString()}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default RealTimeUpdates;