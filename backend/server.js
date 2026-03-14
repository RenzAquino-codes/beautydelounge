require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE;
const pendingUsers = {};
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // para sa gmail to boss ahahahahha
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
    console.log('uploads folder created ✅');
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));
// =====================
// SCHEMAS
// =====================


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    middleName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' }
});

const stockSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String },
    imageUrl: { type: String }

});

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String }
});

const transactionSchema = new mongoose.Schema({
    client: { type: String, required: true },
    service: { type: mongoose.Schema.Types.Mixed, required: true },
    amount: { type: Number, required: true },
    date: { type: String },
    status: { type: String, default: "Paid" }
});
const User = mongoose.model("User", userSchema);
const Stock = mongoose.model("Stock", stockSchema);
const Service = mongoose.model("Service", serviceSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

// =====================
// AUTH ROUTES
// =====================
// =====================
// LOGIN ROUTES
// =====================
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === "admin@test.com" && password === "admin123") {
            return res.json({
                message: "Static Login Successful!",
                user: {
                    firstName: "System",
                    middleName: "",
                    lastName: "Admin",
                    email, role: "static-admin"
                }
            });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found!" });
        // if (user.password !== password) return res.status(400).json({ error: "Incorrect Password!" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Incorrect Password!" });

        const { password: pwd, ...userData } = user.toObject();
        res.json({
            message: "Login Successful!",
            user: userData
        });
    } catch (err) {
        res.status(500).json({
            error: "Server error"
        });
    }
});
// =====================
// REGISTER ROUTES
// =====================
app.post("/api/register", async (req, res) => {
    try {
        const { firstName, middleName, lastName, email, password, adminCode } = req.body;
        const nameRegex = /^[a-zA-Z\s]+$/; // Validation sa password
        if (!nameRegex.test(firstName))
            return res.status(400).json({
                error: "First name must contain letters only."
            });
        if (middleName && !nameRegex.test(middleName))
            return res.status(400).json({
                error: "Middle name must contain letters only."
            });
        if (!nameRegex.test(lastName))
            return res.status(400).json({
                error: "Last name must contain letters only."
            });

        // Check if email already exists in DB
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({
                error: "Email already registered"
            });
        const role = adminCode === ADMIN_SECRET_CODE ? 'admin' : 'staff';
        // Generate a 6-digit code for verification
        const code = crypto.randomInt(100000, 999999).toString();

        // Store user data temporarily (expires in 10 minutes)
        pendingUsers[email] = {
            firstName, middleName, lastName, email, password, role,
            code,
            expiresAt: Date.now() + 10 * 60 * 1000
        };
        //Eto yung gmail na mag c-chat sayo for verification code
        await transporter.sendMail({
            from: '"Beauty De Lounge" <renzfrancisaquino@gmail.com>',
            to: email,
            subject: 'Your Verification Code',
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 40px; background: #f5f0e8; border-radius: 16px;">
                    <h2 style="color: #3a3020; letter-spacing: 2px; text-transform: uppercase; font-weight: 300;">Beauty De Lounge</h2>
                    <p style="color: #6b5c45;">Thank you for registering! Use the code below to verify your email:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #c9a84c;">${code}</span>
                    </div>
                    <p style="color: #8c7a60; font-size: 13px;">This code expires in 10 minutes.</p>
                </div>
            `
        });

        res.json({
            message: "Verification code sent to your email."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Server error"
        });
    }
});
// Verify the code -> save user to DB
app.post("/api/verify-email", async (req, res) => {
    try {
        const { email, code } = req.body;
        const pending = pendingUsers[email];

        if (!pending)
            return res.status(400).json({
                error: "No registration found for this email."
            });

        if (Date.now() > pending.expiresAt)
            return res.status(400).json({
                error: "Code has expired. Please register again."
            });

        if (pending.code !== code)
            return res.status(400).json({
                error: "Incorrect code. Please try again."
            });

        const hashedPassword = await bcrypt.hash(pending.password, 10);
        // Save to DB
        const user = new User({
            firstName: pending.firstName,
            middleName: pending.middleName,
            lastName: pending.lastName,
            email: pending.email,
            password: hashedPassword,
            role: pending.role
        });
        await user.save();

        // Clean up
        delete pendingUsers[email];

        res.json({
            message: "Email verified! Account created successfully."
        });

    } catch (err) {
        res.status(500).json({
            error: "Server error"
        });
    }
});
// =====================
// STOCKS ROUTES
// =====================
app.get("/api/stocks", async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (err) {
        res.status(500).json({
            error: "Server error"
        });
    }
});

app.post("/api/stocks", async (req, res) => {
    try {
        const stock = new Stock(req.body);
        await stock.save();
        res.json(stock);
    } catch (err) {
        res.status(400).json({
            error:
                err.message
        });
    }
});

app.put("/api/stocks/:id", async (req, res) => {
    try {
        const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(stock);
    } catch (err) {
        res.status(400).json({
            error:
                err.message
        });
    }
});

app.delete("/api/stocks/:id", async (req, res) => {
    try {
        await Stock.findByIdAndDelete(req.params.id);
        res.json({
            message: "Deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            error: "Server error"
        });
    }
});
// =====================
// SERVICE PRICING ROUTES
// =====================
app.get("/api/services", async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({
            error: "Server error"
        });
    }
});

app.post("/api/services", async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.json(service);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});

app.put("/api/services/:id", async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(service);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});

app.delete("/api/services/:id", async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({
            error: "Server error"
        });
    }
});
// =====================
// TRANSACTION ROUTES
// =====================
app.get("/api/transactions", async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({
            error: "Server error"
        });
    }
});

app.post("/api/transactions", async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.json(transaction);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});

app.delete("/api/transactions/:id", async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({
            error: "Server error"
        });
    }
});

// app.get("/api/check-users", async (req, res) => {
//     const users = await User.find({}, { password: 0 }); // hides password
//     res.json(users);
// });


// Store uploaded images in /uploads folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const upload = multer({ storage });

// Image upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ imageUrl: `https://beautydelounge-backend.onrender.com/uploads/${req.file.filename}` });
});

app.put("/api/users/:id", async (req, res) => {
    try {
        const { firstName, middleName, lastName, password } = req.body;
        const updateData = { firstName, middleName, lastName };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10); // 
        }
        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        const { password: pwd, ...userData } = user.toObject();
        res.json({ message: "Profile updated!", user: userData });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Temporary store for reset codes
const resetCodes = {};

// STEP 1 — Request reset code
app.post("/api/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "No account found with this email." });

        const code = crypto.randomInt(100000, 999999).toString();
        resetCodes[email] = {
            code,
            expiresAt: Date.now() + 10 * 60 * 1000
        };

        await transporter.sendMail({
            from: '"Beauty De Lounge" <renzfrancisaquino@gmail.com>',
            to: email,
            subject: 'Password Reset Code',
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 40px; background: #f5f0e8; border-radius: 16px;">
                    <h2 style="color: #3a3020; letter-spacing: 2px; text-transform: uppercase; font-weight: 300;">Beauty De Lounge</h2>
                    <p style="color: #6b5c45;">You requested a password reset. Use the code below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #c9a84c;">${code}</span>
                    </div>
                    <p style="color: #8c7a60; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
                </div>
            `
        });

        res.json({ message: "Reset code sent to your email." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// STEP 2 — Verify code + set new password
app.post("/api/reset-password", async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        const pending = resetCodes[email];

        if (!pending)
            return res.status(400).json({ error: "No reset request found for this email." });
        if (Date.now() > pending.expiresAt)
            return res.status(400).json({ error: "Code has expired. Please request again." });
        if (pending.code !== code)
            return res.status(400).json({ error: "Incorrect code. Please try again." });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        delete resetCodes[email];
        res.json({ message: "Password reset successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
app.listen(process.env.PORT || 5000, () => 
    console.log(`Server running on port ${process.env.PORT || 5000}`)
);