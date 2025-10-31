const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserCredentials = require("../models/UserCredentials");
const UserProfile = require("../models/UserProfile");
const { encryptPassword, checkPassword } = require("../utils/passwordUtils");

const validate = (name, email, password) => {
    const errors = {};

    if (!name) errors.name = "Name is required.";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        errors.email = "Invalid email format.";
    }

    if (name && name.length < 3) errors.name = "Name must be at least 3 characters long";
    if (password && password.length < 6) errors.password = "Password must be at least 6 characters long";

    return Object.keys(errors).length > 0 ? errors : null;
};

// register controller
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    const validationErrors = validate(name, email, password);
    if (validationErrors) {
        return res.status(400).json({ message: "Validation failed", errors: validationErrors});
    }
    try {
        const existingUser = await UserCredentials.findOne({ email });
        if (existingUser ) {
          return res.status(400).json({ message: "User already exists"});
    }

    const hashedPassword = await encryptPassword(password);
    const newUser = new UserCredentials({ name, email, password: hashedPassword});
    await newUser.save();

    const newUserProfile = new UserProfile({
            user: newUser._id,
            fullName: name,
            address: '',
            city: '',
            state: '',
            zipcode: '',
            skills: [],
            preferences: [],
            availability: []
        });
        await newUserProfile.save();
    
        res.status(201).json({
             message: "User registered successfully (credentials + initial profile created)",
            userId: newUser._id
         });
  } catch (err) {
    console.error("Register error", err);
    const status = (err.name === 'ValidationError' || err.code === 11000) ? 400 : 500;
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//login controller
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required."});
    }

    try {
    const user = await UserCredentials.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials"});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    
    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "DEV_SECRET",
        { expiresIn: "1h" }
    );

    res.json({ 
        message: "Login successful", 
        token,
         user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
    }
};
