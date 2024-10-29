// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const hangarRoutes = require('./routes/hangarRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingsRouter = require('./routes/bookingRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');



const app = express();

//CORS options
app.use(cors({
  origin: [
    'http://localhost:3000',
    'your-vercel-frontend-url'  // Add your frontend URL
],  
  credentials: true
}));
app.use(cors());

// Middleware
 app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/hangars', hangarRoutes);
app.use('/api/services', serviceRoutes )
app.use('/api/bookings', bookingsRouter);
app.use('/api/dashboard', dashboardRouter);




// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
