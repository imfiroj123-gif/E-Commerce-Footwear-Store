const dotenv = require('dotenv');
const app = require('./backend/app');
const connectDB = require('./backend/config/db');

dotenv.config();

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
