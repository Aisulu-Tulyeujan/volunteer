const express = require('express');
const BodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes'); 
const eventRoutes = require('./routes/eventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');


dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(BodyParser.json());

app.use('/api/auth', authRoutes);

app.use('/api/profiles', volunteerRoutes);


app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);


app.get('/', (req, res) => {
    res.send('Node.js Auth Backend is Running!');
});

app.listen(PORT, () => {
    console.log('Server listening on http://localhost:${PORT}');
});
