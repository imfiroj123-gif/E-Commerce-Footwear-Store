const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const connectDB = require('./backend/config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', require('./backend/routes/productRoutes'));
app.use('/api/users', require('./backend/routes/userRoutes'));
app.use('/api/orders', require('./backend/routes/orderRoutes'));
app.use(express.static(path.join(__dirname, 'frontend')));

const port = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`ZIVO is running at http://localhost:${port}`);
    });
};

startServer().catch((error) => {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
});
