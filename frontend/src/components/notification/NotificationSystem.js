// frontend/src/components/notification/NotificationSystem.js
import React, { useState } from 'react';
import { 
  Badge, 
  IconButton, 
  Menu, 
  MenuItem, 
  Box, 
  Typography 
} from '@mui/material';

const NotificationSystem = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications] = useState([]);
  const notificationCount = notifications.length;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton 
        color="inherit" 
        onClick={handleClick}
        sx={{ 
          border: '2px solid currentColor',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Badge badgeContent={notificationCount} color="error">
          <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
            🔔
          </Typography>
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 300,
            width: '300px'
          }
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification, index) => (
            <MenuItem key={index} onClick={handleClose}>
              <Typography variant="body2">
                {notification.message}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
};

export default NotificationSystem;