// frontend/src/components/payment/PaymentProcessor.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Card,
  CardContent
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { CreditCard, AccountBalance } from '@mui/icons-material';
import api from '../../services/api';

const PaymentProcessor = ({ open, onClose, booking, onPaymentComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const steps = ['Select Payment Method', 'Enter Details', 'Confirm Payment'];

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const validateCardDetails = () => {
    if (!cardDetails.number || cardDetails.number.length < 16) {
      setError('Invalid card number');
      return false;
    }
    if (!cardDetails.expiry || !cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) {
      setError('Invalid expiry date');
      return false;
    }
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      setError('Invalid CVC');
      return false;
    }
    if (!cardDetails.name) {
      setError('Please enter cardholder name');
      return false;
    }
    return true;
  };

  const processPayment = async () => {
    if (!validateCardDetails()) return;

    setLoading(true);
    try {
      // Simulate payment processing
      const response = await api.post('/payments', {
        bookingId: booking.id,
        amount: booking.amount,
        currency: booking.currency,
        paymentMethod,
        cardDetails: {
          ...cardDetails,
          number: `****${cardDetails.number.slice(-4)}`
        }
      });

      if (response.data.status === 'success') {
        setActiveStep(2);
        onPaymentComplete(response.data.paymentId);
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      processPayment();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Payment Process
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Payment Method
            </Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <FormControlLabel
                value="card"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CreditCard sx={{ mr: 1 }} />
                    Credit/Debit Card
                  </Box>
                }
              />
              <FormControlLabel
                value="bank"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalance sx={{ mr: 1 }} />
                    Bank Transfer
                  </Box>
                }
              />
            </RadioGroup>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Enter Payment Details
            </Typography>
            {paymentMethod === 'card' ? (
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  margin="normal"
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Expiry (MM/YY)"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    margin="normal"
                  />
                  <TextField
                    label="CVC"
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                    margin="normal"
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  margin="normal"
                />
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography>Bank Transfer Details:</Typography>
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography>Bank: Example Bank</Typography>
                    <Typography>Account Number: XXXX-XXXX-XXXX</Typography>
                    <Typography>Reference: {booking.id}</Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography>
              Your booking has been confirmed. A confirmation email has been sent to your address.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {activeStep < 2 && (
          <>
            <Button onClick={onClose}>Cancel</Button>
            {activeStep > 0 && (
              <Button onClick={handleBack}>Back</Button>
            )}
            <LoadingButton
              loading={loading}
              variant="contained"
              onClick={handleNext}
            >
              {activeStep === 1 ? 'Pay Now' : 'Next'}
            </LoadingButton>
          </>
        )}
        {activeStep === 2 && (
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentProcessor;