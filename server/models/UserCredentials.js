const mongoose = require("mongoose");

const userCredentialsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum: ['admin', 'volunteer'],
        default: 'volunteer'
    },
});


module.exports = mongoose.model("UserCredentials", userCredentialsSchema);

