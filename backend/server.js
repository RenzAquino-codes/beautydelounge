// require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const dns = require('dns');
// dns.setDefaultResultOrder('ipv4first');
// dns.setServers(['8.8.8.8', '8.8.4.4']);

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const multer = require('multer');
// const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE;
// const STAFF_SECRET_CODE = process.env.STAFF_SECRET_CODE;
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// // const transporter = nodemailer.createTransport({
// //     service: 'gmail',
// //     auth: {
// //         user: process.env.EMAIL_USER,
// //         pass: process.env.EMAIL_PASS
// //     }
// // })
// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true, // Use SSL
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     },
//     tls: {
//         // Do not fail on invalid certs
//         rejectUnauthorized: false
//     }
// });
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const bcrypt = require('bcrypt');
// const app = express();
// app.use(cors({
//     origin: 'https://beautydelounge.vercel.app',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

// const helmet = require('helmet');

// app.use(helmet()); 
// app.use(express.json());
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });
// ;
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'beauty_de_lounge',
//         allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
//     },
// });
// const upload = multer({ storage });

// const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/beautydelounge';
// const mongooseOptions = {
//     serverSelectionTimeoutMS: 10000,
// };

// async function connectToMongo() {
//     try {
//         await mongoose.connect(mongoUri, mongooseOptions);
//         console.log('Connected to MongoDB');
//     } catch (err) {
//         console.error('Error connecting to MongoDB:', err);
//         process.exit(1);
//     }
// }

// // =====================
// // SCHEMAS
// // =====================

// const userSchema = new mongoose.Schema({
//     firstName: { type: String, required: true },
//     middleName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     email: { type: String, required: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['admin', 'staff'], default: 'staff' }
// });

// const stockSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     category: { type: String },

//     quantity: { type: Number, required: true, min: [0.01, "Quantity must be greater than zero"] },
//     unit: { type: String },
//     imageUrl: { type: String }
// });

// const serviceSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     category: { type: String },
  
//     price: { type: Number, required: true, min: [1.00, "Price must be greater than zero"] },
//     imageUrl: { type: String }
// });

// const transactionSchema = new mongoose.Schema({
//     client: { type: String, required: true },
//     service: { type: mongoose.Schema.Types.Mixed, required: true },
 
//     amount: { type: Number, required: true, min: [1.00, "Amount must be greater than zero"] },
//     date: { type: String },
//     time: { type: String },
//     status: { type: String, default: "Paid" }
// });

// // =====================
// // CATEGORY SCHEMA
// // type: 'stock' | 'service'
// // =====================
// const categorySchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     type: { type: String, enum: ['stock', 'service'], required: true }
// });
// // Prevent duplicate category names per type
// categorySchema.index({ name: 1, type: 1 }, { unique: true });
// const Category = mongoose.model("Category", categorySchema);

// // =====================
// // AUDIT LOG SCHEMA
// // =====================
// const auditLogSchema = new mongoose.Schema({
//     userName: { type: String, required: true },
//     role: { type: String, required: true },
//     action: { type: String, required: true },
//     details: { type: String },
//     timestamp: { type: Date, default: Date.now }
// });
// const AuditLog = mongoose.model("AuditLog", auditLogSchema);
// // =====================
// // TEMPORARY DATA SCHEMAS (TTL)
// // =====================

// const pendingUserSchema = new mongoose.Schema({
//     firstName: { type: String, required: true },
//     middleName: { type: String },
//     lastName: { type: String, required: true },
//     email: { type: String, required: true },
//     password: { type: String, required: true },
//     role: { type: String, required: true },
//     code: { type: String, required: true },
//     // This tells MongoDB to automatically delete the document after 600 seconds (10 minutes)
//     createdAt: { type: Date, default: Date.now, expires: 600 }
// });
// const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

// const resetCodeSchema = new mongoose.Schema({
//     email: { type: String, required: true },
//     code: { type: String, required: true },
//     // Expires in 600 seconds (10 minutes)
//     createdAt: { type: Date, default: Date.now, expires: 600 }
// });
// const ResetCode = mongoose.model("ResetCode", resetCodeSchema);

// const User = mongoose.model("User", userSchema);
// const Stock = mongoose.model("Stock", stockSchema);
// const Service = mongoose.model("Service", serviceSchema);
// const Transaction = mongoose.model("Transaction", transactionSchema);


// // =====================
// // AUTH MIDDLEWARE
// // =====================
// const verifyToken = (req, res, next) => {
    
//     const authHeader = req.header("Authorization");

//     if (!authHeader) {
//         return res.status(401).json({ error: "Access denied. No token provided." });
//     }
//     try {
//         const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
//         const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

//         req.user = verified;
//         next();
//     } catch (err) {
//         res.status(403).json({ error: "Invalid or expired token." });
//     }
// };

// // Admin-only middleware
// const verifyAdmin = (req, res, next) => {
//     // Check for both admin types so static-admins can also add categories
//     if (req.user?.role !== 'admin' && req.user?.role !== 'static-admin') {
//         return res.status(403).json({ error: "Admin access required." });
//     }
//     next();
// };

// // =====================
// // AUDIT LOGGER UTILITY
// // =====================
// const logAction = async (req, action, details = "") => {
//     try {
//         // req.user exists because of your verifyToken middleware!
//         const userName = req.user ? `${req.user.firstName || 'Unknown'} ${req.user.lastName || 'User'}` : 'System';
//         const role = req.user ? req.user.role : 'system';
        
//         const log = new AuditLog({
//             userName: userName.trim(),
//             role,
//             action,
//             details
//         });
//         await log.save();
//     } catch (err) {
//         console.error("Failed to save audit log:", err);
//     }
// };

// // =====================
// // Default Admin Account Creation
// // This function needs to be defined BEFORE app.listen
// // =====================
// async function createDefaultAdmin() {
//     try {
//         const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'Padmin@example.com';
//         // IMPORTANT: Use Padmin123 if that's what you're testing with,
//         // or ensure your .env DEFAULT_ADMIN_PASSWORD matches.
//         const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Padmin123'; 

//         const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });

//         if (!existingAdmin) {
//             const hashedPassword = await bcrypt.hash(adminPassword, 10);
//             const defaultAdmin = new User({
//                 firstName: 'Default',
//                 middleName: 'Default',
//                 lastName: 'Admin',
//                 email: adminEmail,
//                 password: hashedPassword,
//                 role: 'admin'
//             });
//             await defaultAdmin.save();
//             console.log(`Default admin account created: ${adminEmail}`);
//         } else {
//             console.log('Default admin account already exists.');
//         }
//     } catch (error) {
//         console.error('Error creating default admin account:', error);
//     }
// }

// // =====================
// // AUTH ROUTES
// // =====================
// // =====================
// // LOGIN ROUTES
// // =====================
// app.post("/api/login", async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // 1. Find the user in the Database
//         const user = await User.findOne({ email });
//         if (!user) return res.status(400).json({ error: "User not found!" });

//         // 2. Verify the password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ error: "Incorrect Password!" });

//         // 3. Create a JWT for the verified user
//         const token = jwt.sign(
//             { 
//                 id: user._id, 
//                 role: user.role, 
//                 firstName: user.firstName,
//                 lastName: user.lastName,   
//                 email: user.email          
//             },
//             process.env.JWT_SECRET || 'fallback_secret',
//             { expiresIn: '1d' }
//         );

//         // Remove the password from the object before sending it to the frontend
//         const { password: pwd, ...userData } = user.toObject();

//         // 4. Send both the user data AND the secure token
//         res.json({
//             message: "Login Successful!",
//             token: token,
//             user: userData
//         });

//     } catch (err) {
//         console.error("LOGIN ERROR:", err);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// // =====================
// // REGISTER ROUTES
// // =====================
// app.post("/api/register", async (req, res) => {
//     try {
//         const { firstName, middleName, lastName, email, password, adminCode } = req.body;
//         const isAdmin = adminCode === process.env.ADMIN_SECRET_CODE;
//         const isStaff = adminCode === process.env.STAFF_SECRET_CODE;

//         if (!isAdmin && !isStaff) {
//             return res.status(401).json({ 
//                 error: "Invalid access code. You are not authorized to register." 
//             });
//         }
//         const role = isAdmin ? 'admin' : 'staff';

//         const nameRegex = /^[a-zA-Z\s]+$/; 
//         if (!nameRegex.test(firstName))
//             return res.status(400).json({
//                 error: "First name must contain letters only."
//             });
//         if (middleName && !nameRegex.test(middleName))
//             return res.status(400).json({
//                 error: "Middle name must contain letters only."
//             });
//         if (!nameRegex.test(lastName))
//             return res.status(400).json({
//                 error: "Last name must contain letters only."
//             });

//         // Check if email already exists in DB
//         const existingUser = await User.findOne({ email });
//         if (existingUser)
//             return res.status(400).json({
//                 error: "Email already registered"
//             });
        
//         // Generate a 6-digit code for verification
//         const code = crypto.randomInt(100000, 999999).toString();
//         // Check if there's already a pending registration and delete it to prevent duplicates
//         await PendingUser.deleteOne({ email });

//         // Store user data temporarily in MongoDB (expires in 10 minutes)
//         const pendingUser = new PendingUser({
//             firstName, middleName, lastName, email, password, role, code
//         });
//         await pendingUser.save();

//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Password Reset Code',
//             html: `
//             <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 40px; background: #f5f0e8; border-radius: 16px;">
//                 <h2 style="color: #3a3020; letter-spacing: 2px; text-transform: uppercase; font-weight: 300;">Beauty De Lounge</h2>
//                 <p style="color: #6b5c45;">You requested a password reset. Use the code below:</p>
//                 <div style="text-align: center; margin: 30px 0;">
//                     <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #c9a84c;">${code}</span>
//                 </div>
//                 <p style="color: #8c7a60; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
//             </div>
//             `
//         });
//         res.json({
//             message: "Verification code sent to your email."
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             error: "Server error"
//         });
//     }
// });
// // Verify the code -> save user to DB
// app.post("/api/verify-email", async (req, res) => {
//     try {
//         const { email, code } = req.body;

//         // Find the pending user in the database
//         const pending = await PendingUser.findOne({ email });

//         if (!pending)
//             return res.status(400).json({
//                 error: "No registration found or the code has expired. Please register again."
//             });

//         if (pending.code !== code)
//             return res.status(400).json({
//                 error: "Incorrect code. Please try again."
//             });

//         const hashedPassword = await bcrypt.hash(pending.password, 10);

//         // Save to DB
//         const user = new User({
//             firstName: pending.firstName,
//             middleName: pending.middleName,
//             lastName: pending.lastName,
//             email: pending.email,
//             password: hashedPassword,
//             role: pending.role
//         });
//         await user.save();

//         // Clean up the pending document now that they are verified
//         await PendingUser.deleteOne({ email });

//         res.json({ message: "Email verified! Account created successfully." });

//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });

// // =====================
// // CATEGORY ROUTES
// // GET /api/categories?type=stock  (or ?type=service)
// // POST /api/categories            (admin only)
// // DELETE /api/categories/:id      (admin only)
// // =====================
// app.get("/api/categories", verifyToken, async (req, res) => {
//     try {
//         const filter = req.query.type ? { type: req.query.type } : {};
//         const categories = await Category.find(filter).sort({ name: 1 });
//         res.json(categories);
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });

// app.post("/api/categories", verifyToken, verifyAdmin, async (req, res) => {
//     try {
//         const { name, type } = req.body;
//         if (!name || !type) return res.status(400).json({ error: "Name and type are required." });
//         const trimmed = name.trim();
//         if (!trimmed) return res.status(400).json({ error: "Category name cannot be empty." });

//         const category = new Category({ name: trimmed, type });
//         await category.save();
//         res.json(category);
//     } catch (err) {
//         if (err.code === 11000) {
//             return res.status(400).json({ error: "Category already exists." });
//         }
//         res.status(400).json({ error: err.message });
//     }
// });

// app.delete("/api/categories/:id", verifyToken, verifyAdmin, async (req, res) => {
//     try {
//         await Category.findByIdAndDelete(req.params.id);
//         res.json({ message: "Category deleted." });
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });

// // =====================
// // STOCKS ROUTES
// // =====================
// app.get("/api/stocks", verifyToken, async (req, res) => {
//     try {
//         const stocks = await Stock.find();
//         res.json(stocks);
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });

// app.post("/api/stocks", verifyToken, async (req, res) => {
//     try {
//         const stock = new Stock(req.body);
//         await stock.save();
//         res.json(stock);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// app.put("/api/stocks/:id", verifyToken, async (req, res) => {
//     try {
//         const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
//         // ADDED AUDIT LOG
//         if (stock) {
//             await logAction(req, "Updated Stock", `Edited item: ${stock.name}`);
//         }
        
//         res.json(stock);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// app.delete("/api/stocks/:id", verifyToken, async (req, res) => {
//     try {
//         const deletedStock = await Stock.findByIdAndDelete(req.params.id);
        
//         // ADD THIS LINE:
//         if (deletedStock) {
//             await logAction(req, "Deleted Stock", `Removed item: ${deletedStock.name}`);
//         }
        
//         res.json({ message: "Deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });
// // =====================
// // SERVICE PRICING ROUTES
// // =====================
// app.get("/api/services", verifyToken, async (req, res) => {
//     try {
//         const services = await Service.find();
//         res.json(services);
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });

// app.post("/api/services", verifyToken, async (req, res) => {
//     try {
//         const service = new Service(req.body);
//         await service.save();
//         res.json(service);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// app.put("/api/services/:id", verifyToken, async (req, res) => {
//     try {
//         const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
//         // ADDED AUDIT LOG
//         if (service) {
//             await logAction(req, "Updated Service", `Edited service pricing: ${service.name}`);
//         }
        
//         res.json(service);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// app.delete("/api/services/:id", verifyToken, async (req, res) => {
//     try {
//         await Service.findByIdAndDelete(req.params.id);
//         res.json({ message: "Deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });
// // =====================
// // TRANSACTION ROUTES
// // =====================
// app.get("/api/transactions", verifyToken, async (req, res) => {
//     try {
//         const transactions = await Transaction.find().sort({ date: -1 });
//         res.json(transactions);
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });

// app.post("/api/transactions", verifyToken, async (req, res) => {
//     try {
//         const transaction = new Transaction(req.body);
//         await transaction.save();
        
//         // ADDED AUDIT LOG
//         await logAction(req, "Created Transaction", `Recorded new transaction for client: ${transaction.client}`);
        
//         res.json(transaction);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });


// app.put("/api/transactions/:id", verifyToken, async (req, res) => {
//     try {
//         const transaction = await Transaction.findByIdAndUpdate(
//             req.params.id, 
//             req.body, 
//             { new: true } 
//         );
//         if (!transaction) return res.status(404).json({ error: "Transaction not found" });
        
//         // ADDED AUDIT LOG
//         await logAction(req, "Updated Transaction", `Edited transaction for client: ${transaction.client}`);
        
//         res.json(transaction);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// app.delete("/api/transactions/:id", verifyToken, async (req, res) => {
//     try {
//         const deleted = await Transaction.findByIdAndDelete(req.params.id);
//         if (!deleted) return res.status(404).json({ error: "Transaction not found" });
//         res.json({ message: "Deleted successfully" });
//     } catch (err) {
//         console.error("DELETE ERROR:", err);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// app.get("/api/stocks/low-stock", verifyToken, async (req, res) => {
//     try {
//         // This finds all items where quantity is less than 5
//         const lowStockItems = await Stock.find({ quantity: { $lt: 5 } });
//         res.json(lowStockItems);
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });

// app.post('/api/upload', verifyToken, upload.single('image'), (req, res) => {
//     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
//     res.json({ imageUrl: req.file.path }); 
// });

// app.put("/api/users/:id", verifyToken, async (req, res) => {
//     try {
//         const { firstName, middleName, lastName, password } = req.body;
//         const updateData = { firstName, middleName, lastName };
//         if (password) {
//             updateData.password = await bcrypt.hash(password, 10);
//         }
//         const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
//         const { password: pwd, ...userData } = user.toObject();
        
//         // ADDED AUDIT LOG
//         await logAction(req, "Updated Profile", `Updated account details for: ${firstName} ${lastName}`);
        
//         res.json({ message: "Profile updated!", user: userData });
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });


// // GET all users (admin only)
// app.get("/api/users", verifyToken, verifyAdmin, async (req, res) => {
//     try {
//         const users = await User.find({}, { password: 0 });
//         res.json(users);
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });

// // DELETE user (admin only)
// app.delete("/api/users/:id", verifyToken, verifyAdmin, async (req, res) => {
//     try {
//         await User.findByIdAndDelete(req.params.id);
//         res.json({ message: "User deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });

// // POST create user by admin (skips access code, uses role directly)
// app.post("/api/admin/create-user", verifyToken, verifyAdmin, async (req, res) => {
//     try {
//         const { firstName, middleName, lastName, email, password, role } = req.body;

//         const existingUser = await User.findOne({ email });
//         if (existingUser)
//             return res.status(400).json({ error: "Email already registered" });

//         const nameRegex = /^[a-zA-Z\s]+$/;
//         if (!nameRegex.test(firstName))
//             return res.status(400).json({ error: "First name must contain letters only." });
//         if (!nameRegex.test(lastName))
//             return res.status(400).json({ error: "Last name must contain letters only." });

//         const code = crypto.randomInt(100000, 999999).toString();
//         await PendingUser.deleteOne({ email });

//         const pendingUser = new PendingUser({
//             firstName, middleName, lastName, email, password, role, code
//         });
//         await pendingUser.save();

//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Your Beauty De Lounge Account Verification',
//             html: `
//             <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 40px; background: #f5f0e8; border-radius: 16px;">
//                 <h2 style="color: #3a3020; letter-spacing: 2px; text-transform: uppercase; font-weight: 300;">Beauty De Lounge</h2>
//                 <p style="color: #6b5c45;">An admin has created an account for you. Use the code below to verify your email:</p>
//                 <div style="text-align: center; margin: 30px 0;">
//                     <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #c9a84c;">${code}</span>
//                 </div>
//                 <p style="color: #8c7a60; font-size: 13px;">This code expires in 10 minutes.</p>
//             </div>
//             `
//         });

//         res.json({ message: "Verification code sent to the user's email." });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// // STEP 1 — Request reset code
// app.post("/api/forgot-password", async (req, res) => {
//     try {
//         const { email } = req.body;
//         const user = await User.findOne({ email });
//         if (!user) return res.status(400).json({ error: "No account found with this email." });

//         const code = crypto.randomInt(100000, 999999).toString();
//         // Remove any existing reset codes for this user
//         await ResetCode.deleteOne({ email });

//         // Save the new code to MongoDB
//         const resetRecord = new ResetCode({ email, code });
//         await resetRecord.save();

//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Password Reset Code',
//             html: `
//             <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 40px; background: #f5f0e8; border-radius: 16px;">
//                 <h2 style="color: #3a3020; letter-spacing: 2px; text-transform: uppercase; font-weight: 300;">Beauty De Lounge</h2>
//                 <p style="color: #6b5c45;">You requested a password reset. Use the code below:</p>
//                 <div style="text-align: center; margin: 30px 0;">
//                     <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #c9a84c;">${code}</span>
//                 </div>
//                 <p style="color: #8c7a60; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
//             </div>
//             `
//         });
//         res.json({ message: "Reset code sent to your email." });
//     } catch (err) {
//         console.error("FORGOT PASSWORD ERROR:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // STEP 2 — Verify code + set new password
// app.post("/api/reset-password", async (req, res) => {
//     try {
//         const { email, code, newPassword } = req.body;

//         // Find the reset code in the database
//         const pending = await ResetCode.findOne({ email });

//         if (!pending)
//             return res.status(400).json({ error: "No reset request found or the code has expired." });

//         if (pending.code !== code)
//             return res.status(400).json({ error: "Incorrect code. Please try again." });

//         const hashedPassword = await bcrypt.hash(newPassword, 10);
//         await User.findOneAndUpdate({ email }, { password: hashedPassword });

//         // Clean up the code after successful reset
//         await ResetCode.deleteOne({ email });

//         res.json({ message: "Password reset successfully!" });
//     } catch (err) {
//         console.error("RESET PASSWORD ERROR:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // =====================
// // AUDIT LOG ROUTES
// // =====================
// // Only Admins should be able to view the audit logs
// app.get("/api/audit-logs", verifyToken, verifyAdmin, async (req, res) => {
//     try {
//         // Fetch logs and sort by newest first, limit to the last 100 to save bandwidth
//         const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
//         res.json(logs);
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });

// app.get("/api/health", (req, res) => {
//     res.json({ status: "ok" });
// });

// // The app.listen call MUST await createDefaultAdmin()
// async function startServer() {
//     await connectToMongo();
//     await createDefaultAdmin();

//     app.listen(process.env.PORT || 5000, () => {
//         console.log(`Server running on port ${process.env.PORT || 5000}`);
//     });
// }

// startServer();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE;
const STAFF_SECRET_CODE = process.env.STAFF_SECRET_CODE;
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    family: 4, // Force IPv4
    tls: {
        rejectUnauthorized: false
    }
});

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const bcrypt = require('bcrypt');
const app = express();

// =====================
// CORS — Must be BEFORE helmet and all routes
// =====================
const allowedOrigins = [
    'https://beautydelounge.vercel.app',
    'http://localhost:5173',  // Vite dev
    'http://localhost:3000'   // CRA dev
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle OPTIONS preflight for ALL routes explicitly
// This is critical on Render — the preflight must return 200 before any auth runs
app.options('*', cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const helmet = require('helmet');
app.use(helmet());
app.use(express.json());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'beauty_de_lounge',
        allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});
const upload = multer({ storage });

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/beautydelounge';
const mongooseOptions = {
    serverSelectionTimeoutMS: 10000,
};

async function connectToMongo() {
    try {
        await mongoose.connect(mongoUri, mongooseOptions);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
}

// =====================
// SCHEMAS
// =====================

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
    quantity: { type: Number, required: true, min: [0.01, "Quantity must be greater than zero"] },
    unit: { type: String },
    imageUrl: { type: String }
});

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String },
    price: { type: Number, required: true, min: [1.00, "Price must be greater than zero"] },
    imageUrl: { type: String }
});

const transactionSchema = new mongoose.Schema({
    client: { type: String, required: true },
    service: { type: mongoose.Schema.Types.Mixed, required: true },
    amount: { type: Number, required: true, min: [1.00, "Amount must be greater than zero"] },
    date: { type: String },
    time: { type: String },
    status: { type: String, default: "Paid" }
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['stock', 'service'], required: true }
});
categorySchema.index({ name: 1, type: 1 }, { unique: true });
const Category = mongoose.model("Category", categorySchema);

const auditLogSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String },
    timestamp: { type: Date, default: Date.now }
});
const AuditLog = mongoose.model("AuditLog", auditLogSchema);

const pendingUserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 }
});
const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

const resetCodeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 }
});
const ResetCode = mongoose.model("ResetCode", resetCodeSchema);

const User = mongoose.model("User", userSchema);
const Stock = mongoose.model("Stock", stockSchema);
const Service = mongoose.model("Service", serviceSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);


// =====================
// AUTH MIDDLEWARE
// =====================
const verifyToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }
    try {
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid or expired token." });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'static-admin') {
        return res.status(403).json({ error: "Admin access required." });
    }
    next();
};

// =====================
// AUDIT LOGGER UTILITY
// =====================
const logAction = async (req, action, details = "") => {
    try {
        const userName = req.user ? `${req.user.firstName || 'Unknown'} ${req.user.lastName || 'User'}` : 'System';
        const role = req.user ? req.user.role : 'system';
        const log = new AuditLog({ userName: userName.trim(), role, action, details });
        await log.save();
    } catch (err) {
        console.error("Failed to save audit log:", err);
    }
};

// =====================
// Default Admin Account Creation
// =====================
async function createDefaultAdmin() {
    try {
        const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'Padmin@example.com';
        const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Padmin123';
        const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const defaultAdmin = new User({
                firstName: 'Default',
                middleName: 'Default',
                lastName: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            await defaultAdmin.save();
            console.log(`Default admin account created: ${adminEmail}`);
        } else {
            console.log('Default admin account already exists.');
        }
    } catch (error) {
        console.error('Error creating default admin account:', error);
    }
}

// =====================
// AUTH ROUTES
// =====================
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Incorrect Password!" });

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        const { password: pwd, ...userData } = user.toObject();
        res.json({ message: "Login Successful!", token: token, user: userData });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/register", async (req, res) => {
    try {
        const { firstName, middleName, lastName, email, password, adminCode } = req.body;
        const isAdmin = adminCode === process.env.ADMIN_SECRET_CODE;
        const isStaff = adminCode === process.env.STAFF_SECRET_CODE;

        if (!isAdmin && !isStaff) {
            return res.status(401).json({ error: "Invalid access code. You are not authorized to register." });
        }
        const role = isAdmin ? 'admin' : 'staff';

        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(firstName))
            return res.status(400).json({ error: "First name must contain letters only." });
        if (middleName && !nameRegex.test(middleName))
            return res.status(400).json({ error: "Middle name must contain letters only." });
        if (!nameRegex.test(lastName))
            return res.status(400).json({ error: "Last name must contain letters only." });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ error: "Email already registered" });

        const code = crypto.randomInt(100000, 999999).toString();
        await PendingUser.deleteOne({ email });

        const pendingUser = new PendingUser({ firstName, middleName, lastName, email, password, role, code });
        await pendingUser.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Beauty De Lounge - Email Verification',
            html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 40px; background: #f5f0e8; border-radius: 16px;">
                <h2 style="color: #3a3020; letter-spacing: 2px; text-transform: uppercase; font-weight: 300;">Beauty De Lounge</h2>
                <p style="color: #6b5c45;">Your verification code is below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #c9a84c;">${code}</span>
                </div>
                <p style="color: #8c7a60; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
            </div>
            `
        });
        res.json({ message: "Verification code sent to your email." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/verify-email", async (req, res) => {
    try {
        const { email, code } = req.body;
        const pending = await PendingUser.findOne({ email });

        if (!pending)
            return res.status(400).json({ error: "No registration found or the code has expired. Please register again." });

        if (pending.code !== code)
            return res.status(400).json({ error: "Incorrect code. Please try again." });

        const hashedPassword = await bcrypt.hash(pending.password, 10);
        const user = new User({
            firstName: pending.firstName,
            middleName: pending.middleName,
            lastName: pending.lastName,
            email: pending.email,
            password: hashedPassword,
            role: pending.role
        });
        await user.save();
        await PendingUser.deleteOne({ email });

        res.json({ message: "Email verified! Account created successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// =====================
// TRANSACTION ROUTES
// =====================
app.get("/api/transactions", verifyToken, async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/transactions", verifyToken, async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        await logAction(req, "Created Transaction", `New transaction for client: ${transaction.client}`);
        res.status(201).json(transaction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put("/api/transactions/:id", verifyToken, async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!transaction) return res.status(404).json({ error: "Transaction not found" });
        await logAction(req, "Updated Transaction", `Edited transaction for client: ${transaction.client}`);
        res.json(transaction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete("/api/transactions/:id", verifyToken, async (req, res) => {
    try {
        const deleted = await Transaction.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Transaction not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// =====================
// STOCK ROUTES
// =====================
app.get("/api/stocks", verifyToken, async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/stocks", verifyToken, async (req, res) => {
    try {
        const stock = new Stock(req.body);
        await stock.save();
        await logAction(req, "Added Stock", `Added stock: ${stock.name}`);
        res.status(201).json(stock);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put("/api/stocks/:id", verifyToken, async (req, res) => {
    try {
        const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!stock) return res.status(404).json({ error: "Stock not found" });
        await logAction(req, "Updated Stock", `Updated stock: ${stock.name}`);
        res.json(stock);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete("/api/stocks/:id", verifyToken, async (req, res) => {
    try {
        const deleted = await Stock.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Stock not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/stocks/low-stock", verifyToken, async (req, res) => {
    try {
        const lowStockItems = await Stock.find({ quantity: { $lt: 5 } });
        res.json(lowStockItems);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// =====================
// SERVICE ROUTES
// =====================
app.get("/api/services", verifyToken, async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/services", verifyToken, async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        await logAction(req, "Added Service", `Added service: ${service.name}`);
        res.status(201).json(service);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put("/api/services/:id", verifyToken, async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) return res.status(404).json({ error: "Service not found" });
        await logAction(req, "Updated Service", `Updated service: ${service.name}`);
        res.json(service);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete("/api/services/:id", verifyToken, async (req, res) => {
    try {
        const deleted = await Service.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Service not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// =====================
// CATEGORY ROUTES
// =====================
app.get("/api/categories", verifyToken, async (req, res) => {
    try {
        const { type } = req.query;
        const query = type ? { type } : {};
        const categories = await Category.find(query);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/categories", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: "Category already exists." });
        res.status(400).json({ error: err.message });
    }
});

app.delete("/api/categories/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// =====================
// USER ROUTES
// =====================
app.post('/api/upload', verifyToken, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ imageUrl: req.file.path });
});

app.put("/api/users/:id", verifyToken, async (req, res) => {
    try {
        const { firstName, middleName, lastName, password } = req.body;
        const updateData = { firstName, middleName, lastName };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        const { password: pwd, ...userData } = user.toObject();
        await logAction(req, "Updated Profile", `Updated account details for: ${firstName} ${lastName}`);
        res.json({ message: "Profile updated!", user: userData });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/users", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/api/users/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// POST create user by admin
app.post("/api/admin/create-user", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { firstName, middleName, lastName, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ error: "Email already registered" });

        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(firstName))
            return res.status(400).json({ error: "First name must contain letters only." });
        if (!nameRegex.test(lastName))
            return res.status(400).json({ error: "Last name must contain letters only." });

        const code = crypto.randomInt(100000, 999999).toString();
        await PendingUser.deleteOne({ email });

        const pendingUser = new PendingUser({
            firstName, middleName, lastName, email, password, role, code
        });
        await pendingUser.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Beauty De Lounge Account Verification',
            html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 40px; background: #f5f0e8; border-radius: 16px;">
                <h2 style="color: #3a3020; letter-spacing: 2px; text-transform: uppercase; font-weight: 300;">Beauty De Lounge</h2>
                <p style="color: #6b5c45;">An admin has created an account for you. Use the code below to verify your email:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #c9a84c;">${code}</span>
                </div>
                <p style="color: #8c7a60; font-size: 13px;">This code expires in 10 minutes.</p>
            </div>
            `
        });

        res.json({ message: "Verification code sent to the user's email." });
    } catch (err) {
        console.error("FULL ERROR:", err);
        res.status(500).json({ error: `EMAIL FAILED: ${err.message}` }); 
    }
});

// =====================
// PASSWORD RESET ROUTES
// =====================
app.post("/api/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "No account found with this email." });

        const code = crypto.randomInt(100000, 999999).toString();
        await ResetCode.deleteOne({ email });
        const resetRecord = new ResetCode({ email, code });
        await resetRecord.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
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
        console.error("FORGOT PASSWORD ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/reset-password", async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        const pending = await ResetCode.findOne({ email });

        if (!pending)
            return res.status(400).json({ error: "No reset request found or the code has expired." });
        if (pending.code !== code)
            return res.status(400).json({ error: "Incorrect code. Please try again." });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        await ResetCode.deleteOne({ email });

        res.json({ message: "Password reset successfully!" });
    } catch (err) {
        console.error("RESET PASSWORD ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// =====================
// AUDIT LOG ROUTES
// =====================
app.get("/api/audit-logs", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

async function startServer() {
    await connectToMongo();
    await createDefaultAdmin();
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
}

startServer();