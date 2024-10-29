// frontend/src/components/review/ReviewForm.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography
} from '@mui/material';
import api from '../../services/api';

const ReviewForm = ({ open, onClose, bookingId, itemType, itemId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      await api.post(`/reviews`, {
        bookingId,
        itemType,
        itemId,
        rating,
        comment
      });
      onReviewSubmitted();
      onClose();
    } catch (err) {
      setError('Error submitting review');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Write a Review</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography component="legend">Rating</Typography>
          <Rating
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            size="large"
          />
        </Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Your Review"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          color="primary"
          disabled={!rating || !comment}
        >
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewForm;

