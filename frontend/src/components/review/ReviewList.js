// frontend/src/components/review/ReviewList.js
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Rating,
  Box,
  Avatar,
  Grid
} from '@mui/material';

const ReviewList = ({ reviews }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Reviews ({reviews?.length || 0})
      </Typography>
      <Grid container spacing={2}>
        {reviews?.map((review) => (
          <Grid item xs={12} key={review._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {review.user?.companyName?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {review.user?.companyName || 'Unknown User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(review.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Rating 
                  value={review.rating || 0} 
                  readOnly 
                  precision={0.5}
                  sx={{ display: 'block', mb: 1 }}
                />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mt: 1,
                    color: 'text.primary',
                    lineHeight: 1.6
                  }}
                >
                  {review.comment || 'No comment provided'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {(!reviews || reviews.length === 0) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  align="center"
                  sx={{ py: 4 }}
                >
                  No reviews yet
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

ReviewList.defaultProps = {
  reviews: []
};

export default ReviewList;