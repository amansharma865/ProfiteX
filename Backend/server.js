const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
// Use the routes defined in the routes folder 
const adminRoutes = require('./routes/adminRoutes');
const branchRoutes = require('./routes/branchRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const inventoryBranchRoutes = require('./routes/inventoryBranchRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const superProductRoutes = require('./routes/superProductRoutes.js');
const warehouseRoutes = require('./routes/warehouseRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');S
const { verifyToken } = require('./middlewares/authorize.js');
const Razorpay = require("razorpay")
const PORT = process.env.PORT || 3000;
require('dotenv').config();
const allowedOrigins = [
    'https://profite-x.vercel.app' || 'http://localhost:3001',
    // process.env.ORIGIN_2 || 'https://profitex-iota.vercel.app',
    // process.env.ORIGIN_3 || 'https://profitex-1jdnonhhj-aryan-pathanias-projects.vercel.app',

];

// Middleware to parse JSON requests
app.use(express.json());
app.use(cookieParser());

// CORS setup: allow listed origins (no trailing slash), allow non-browser requests
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
};

app.use(cors(corsOptions));
// Ensure preflight (OPTIONS) requests are handled with same CORS settings
app.options('*', cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const dbConnect = require('./middlewares/dB.js');
dbConnect();

// Routes
app.get('/', (req, res) => {
    res.send('Hello Aryan');
});

app.get('/home', (req, res) => {
    res.send('helloooo');
});

//protected routes api
app.get('/api/getRole', verifyToken, (req, res) => {
    const role = req.user.role; // Extract role from the decoded token
    res.status(200).json({ role });
});

app.post('/orders', async (req, res) => {
    // Initialize Razorpay instance with key ID and secret
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Extract amount and currency from the request body
    const { amount, currency } = req.body;

    // Ensure both amount and currency are provided
    if (!amount || !currency) {
        return res.status(400).send('Missing required fields');
    }

    // Check if the amount is a valid number and is greater than zero
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).send('Invalid amount');
    }

    // Define the Razorpay order options
    const options = {
        amount: amount * 100, // Convert amount to the smallest unit (paise for INR)
        currency: currency,
        receipt: `receipt#${Date.now()}`, // Unique receipt ID
        payment_capture: 1, // Auto capture payment
    };

    try {
        // Create the Razorpay order
        const response = await razorpay.orders.create(options);

        // Respond with order details
        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});

app.get("/payment/:paymentId", async (req, res) => {
    const { paymentId } = req.params;

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    try {
        const payment = await razorpay.payments.fetch(paymentId);
        if (!payment) {
            return res.status(500).json("Error fetching payment details");
        }

        res.json({
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency,
        });
    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json("Failed to fetch payment details");
    }
});



app.use('/admin', adminRoutes);
app.use('/branch', branchRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/inventorybranch', inventoryBranchRoutes);
app.use('/user', userRoutes);
app.use('/order', orderRoutes);
app.use('/products', productRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/superproducts', superProductRoutes);
app.use('/warehouse', warehouseRoutes);
app.use('/notifications', notificationRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
