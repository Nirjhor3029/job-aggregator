require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const { optionalApiKey } = require('./src/middleware/auth');
const { tieredLimiter } = require('./src/middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-aggregator';

app.use(helmet());
app.use(cors());
app.use(express.json());

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const jobsRouter = require('./src/routes/jobs');
const apiKeysRouter = require('./src/routes/apikeys');

app.use('/api/', optionalApiKey, tieredLimiter);

app.use('/api/jobs', jobsRouter);
app.use('/api/apikeys', apiKeysRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Rate Limits: anonymous=30/min, free=300/min, paid=5000/min`);
  console.log(`Use x-api-key header to authenticate`);
});

module.exports = app;
