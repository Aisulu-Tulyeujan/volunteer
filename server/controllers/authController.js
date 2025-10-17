const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Temporary "database" for testing
const users = [
    { id: 1, name: "Admin User", email: "admin@example.com", password: "UH2026$", role: "adminstrator"},
    { id: 2, name: "Volunteer User", email: "volunteer@example.com", password: "UH2026$", role: "volunteer"},
];
let nextUserId = users.length + 1;

const validate = (name, email, password) => {
    const errors = {};

    if (!name) errors.name = "Name is required.";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    if (email & !/^\$+@\S+\.\S+$/.test(email)) {
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

    const existingUsers = users.find((u) => u.email === email);
    if (existingUsers ) {
        return res.status(400).json({ message: "User already exists "});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword,
        role: "volunteer"

    };
    users.push(newUser);

    res.status(201).json({ message: "User refistered successfully" });

};

//login controller
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required. "});
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials"});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials"});
    }
    
    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.encv.JWT_SECRET || "DEV_SECRET",
        { expiresIn: "1h" }
    );

    res.json({ message: "Login succesful", token});
};
