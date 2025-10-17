const express = require('express');
const BodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(BodyParser.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Node.js Auth Backend is Running!');
});

app.listen(PORT, () => {
    console.log('Server listening on http://localhost:${PORT}');
});
