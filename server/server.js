const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
<<<<<<< HEAD
=======
const path = require('path');
>>>>>>> 15d192d (Initial commit)
const authRoutes = require('./routes/authRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const eventRoutes = require('./routes/eventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const app = express();
const PORT = process.env.PORT || 5050;

const defaultOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || defaultOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/profiles', volunteerRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);


app.get('/', (req, res) => {
    res.send('Node.js Auth Backend is Running!');
});

const assignmentRoutes = require('./routes/assignmentRoutes');
app.use('/api/assignments', assignmentRoutes);

const startServer = async () => {
    try {

        const mongoUri = process.env.MONGO_URI
        if (!mongoUri) {
          console.error('MONGO_URI/MONGODB_URI not set. Check server/.env');
          process.exit(1);
        }

        await mongoose.connect(mongoUri, { dbName: 'VolunteerApp' });
        
        console.log("MongoDB connected successfully");
        app.listen(PORT, () => {
            console.log(`Server running successfully on port ${PORT}`);
            console.log(`Use URL: http://localhost:${PORT}/api/auth/register`);
        });
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        console.error("Please check your MONGODB_URI and Atlas IP Access.");
    }
};

startServer();
