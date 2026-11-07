const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const seedAdmin = async () => {
    try {
        await connectDB();

        let adminUser = await User.findOne({ email: 'admin@zivo.com' });

        if (adminUser) {
            if (!adminUser.isAdmin) {
                await User.updateOne({ _id: adminUser._id }, { $set: { isAdmin: true } });
                console.log('Existing admin account restored; password unchanged.');
            } else {
                console.log('Admin user already exists.');
            }
            return;
        }

        const legacyAdmin = await User.findOne({ email: 'admin@quirks.com', isAdmin: true });
        if (legacyAdmin) {
            await User.updateOne({ _id: legacyAdmin._id }, { $set: { email: 'admin@zivo.com' } });
            console.log('Existing admin login updated to admin@zivo.com; password unchanged.');
            return;
        }

        adminUser = new User({
            name: 'Admin User',
            email: 'admin@zivo.com',
            password: 'admin123',
            isAdmin: true,
        });

        await adminUser.save();
        console.log('Admin user created successfully: admin@zivo.com / admin123');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedAdmin();
