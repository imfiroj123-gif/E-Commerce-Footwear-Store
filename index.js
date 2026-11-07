const path = require('path');
const express = require('express');
const connectDB = require('./backend/config/db');
const apiApp = require('./backend/app');

const app = express();

app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error(`Database connection failed: ${error.message}`);
        res.status(503).json({ message: 'Database unavailable' });
    }
});

app.use(apiApp);
app.use(express.static(path.join(__dirname, 'frontend')));

module.exports = app;
