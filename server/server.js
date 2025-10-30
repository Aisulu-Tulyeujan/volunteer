const express = require('express');
const BodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes'); 
const eventRoutes = require('./routes/eventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');


dotenv.config();

const app = express();
const PORT = 5050;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true}));


app.use('/api/auth', authRoutes);
app.use('/profiles', volunteerRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);


app.get('/', (req, res) => {
    res.send('Node.js Auth Backend is Running!');
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

const assignmentRoutes = require('./routes/assignmentRoutes');
app.use('/api/assignments', assignmentRoutes);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
        app.listen(PORT, () => {
            console.log(`Server running successfully on port ${PORT}`);
            console.log(`Use URL: http://localhost:${PORT}/api/auth/register`);
        });
    })
    .catch(err => {
        console.error("MongoDB connection error:", err.message);
        console.error("Please check your MONGODB_URI and Atlas IP Access.");

    });
