const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3200;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const businessesRoute = require('./routes/businesses');
const jobsRoute = require('./routes/jobs');
const housingRoute = require('./routes/housing');
const carsRoute = require('./routes/cars');
const eventsRoute = require('./routes/events');
const marketplaceRoute = require('./routes/marketplace');
const authRoute = require('./routes/auth');
const reviewsRoute = require('./routes/reviews');
const messagesRoute = require('./routes/messages');
const usersRoute = require('./routes/users');

// Mount routes
app.use('/api/businesses', businessesRoute);
app.use('/api/jobs', jobsRoute);
app.use('/api/housing', housingRoute);
app.use('/api/cars', carsRoute);
app.use('/api/events', eventsRoute);
app.use('/api/marketplace', marketplaceRoute);
app.use('/api/auth', authRoute);
app.use('/api/reviews', reviewsRoute);
app.use('/api/messages', messagesRoute);
app.use('/api/users', usersRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Hyerd API running on port ${PORT}`);
});
