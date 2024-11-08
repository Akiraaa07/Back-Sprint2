const express = require('express');
const cors = require('cors');
const app = express();
const feedbackRoutes = require('./routes/feedbackRoutes');
const userRoutes = require('./routes/userRoutes');
const sintomasRoutes = require('./routes/sintomasRoutes');

app.use(express.json());

app.use(cors());

app.use('/api', userRoutes);

app.use('/api/feedback', feedbackRoutes);

app.use('/api/sintomas', sintomasRoutes);

module.exports = app;