import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';
import { generatePasswordResetEmail } from './emailTemplates.js';
import crypto from 'crypto';
import bodyParser from 'body-parser';

const app = express();
const port = 3001;

// --- Middleware ---
// Set up CORS to allow specific origins
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:4173', // Vite preview server
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow ngrok subdomains
    if (/\.ngrok-free\.app$/.test(origin)) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Multer Configuration ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Database Configuration ---
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'b2b_travel_booking_platform'
};
const JWT_SECRET = process.env.JWT_SECRET;

// --- Email Transport ---
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_EMAIL_HOST,
  port: process.env.BREVO_EMAIL_PORT,
  secure: process.env.BREVO_EMAIL_SECURE === 'true', // Use 'true' for port 465, 'false' for 587
  auth: {
    user: process.env.BREVO_EMAIL_USER,
    pass: process.env.BREVO_SMTP_KEY
  }
});

// --- Database Connection Pool ---
const pool = mysql.createPool(dbConfig);

// --- JWT Verification Middleware ---
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).send({ message: 'No token provided.' });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT Error:', err);
      return res.status(401).send({ message: 'Unauthorized: Invalid Token.' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// --- Admin Verification Middleware ---
const verifyAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).send({ message: "Forbidden: Requires Admin Role!" });
  }
  next();
};



// --- User API Routes ---
app.get('/api/users/profile', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, name, email, role, kyc_status, wallet_balance FROM users WHERE id = ?', [req.userId]);
        if (rows.length === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).send({ message: 'Error fetching user profile.' });
    }
});

app.get('/api/users/wallet', verifyToken, async (req, res) => {
    try {
        // CORRECTED: Fetching from the 'wallets' table as per user feedback.
        const [rows] = await pool.execute('SELECT balance, currency FROM wallets WHERE user_id = ?', [req.userId]);
        
        if (rows.length > 0) {
            // The row already contains balance and currency.
            res.json(rows[0]);
        } else {
            // If no wallet entry exists for the user, return a default value.
            res.json({ balance: 0.00, currency: 'INR' });
        }
    } catch (error) {
        console.error('Wallet fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch wallet balance' });
    }
});

app.post('/api/users/wallet/topup', verifyToken, async (req, res) => {
    const { amount, paymentMethod } = req.body;
    if (!amount || !paymentMethod) {
        return res.status(400).json({ message: 'Amount and payment method are required.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // In a real app, you would integrate with a payment gateway here.
        // For this demo, we'll just add the amount to the wallet.
        await connection.execute(
            'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
            [amount, req.userId]
        );
        await connection.execute(
            `INSERT INTO wallet_transactions (agent_id, amount, type, status, related_entity_type)
             VALUES (?, ?, 'credit', 'completed', 'wallet_topup')`,
            [req.userId, amount]
        );
        await connection.commit();
        const [rows] = await connection.execute('SELECT wallet_balance FROM users WHERE id = ?', [req.userId]);
        res.json({ message: 'Top-up successful!', newBalance: rows[0].wallet_balance });
    } catch (error) {
        await connection.rollback();
        console.error('Top-up error:', error);
        res.status(500).json({ message: 'An internal error occurred during top-up.' });
    } finally {
        connection.release();
    }
});

app.get('/api/users/transactions', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT `id`, `amount`, `type`, `currency`, `timestamp` FROM `transactions` WHERE `user_id` = ? ORDER BY `timestamp` DESC',
            [req.userId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Transactions fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch transactions' });
    }
});

app.post('/api/users/kyc', verifyToken, upload.single('document'), async (req, res) => {
    const { documentType } = req.body;
    const documentFile = req.file;

    if (!documentType || !documentFile) {
        return res.status(400).json({ message: 'Document type and file are required.' });
    }

    try {
        await pool.execute(
            "INSERT INTO kyc_documents (user_id, document_type, file_name, file_type, file_data, status) VALUES (?, ?, ?, ?, ?, 'pending')",
            [
                req.userId,
                documentType,
                documentFile.originalname,
                documentFile.mimetype,
                documentFile.buffer
            ]
        );
        await pool.execute(
            "UPDATE users SET kyc_status = 'pending' WHERE id = ?",
            [req.userId]
        );
        res.status(200).json({ message: 'KYC documents submitted successfully. Pending review.' });
    } catch (error) {
        console.error('KYC submission error:', error);
        res.status(500).json({ message: 'Failed to submit KYC documents.' });
    }
});

app.get('/api/admin/kyc-document/:userId', verifyToken, verifyAdmin, async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.execute('SELECT file_data, file_type FROM kyc_documents WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1', [userId]);
        if (rows.length === 0 || !rows[0].file_data) {
            return res.status(404).send('Document not found.');
        }
        const doc = rows[0];
        res.setHeader('Content-Type', doc.file_type);
        res.send(doc.file_data);
    } catch (error) {
        console.error('KYC document fetch error:', error);
        res.status(500).send('Server error');
    }
});

app.post('/api/admin/kyc/request-resubmission', verifyToken, verifyAdmin, async (req, res) => {
    const { userId } = req.body;
    try {
        await pool.execute(
            "UPDATE users SET kyc_status = 'resubmission_requested', kyc_details = NULL, kyc_document = NULL, kyc_document_mimetype = NULL WHERE id = ?",
            [userId]
        );
        // Here you could also trigger an email to the user.
        res.json({ message: 'Resubmission requested successfully.' });
    } catch (error) {
        console.error('KYC resubmission request error:', error);
        res.status(500).json({ message: 'Failed to request resubmission.' });
    }
});

// --- Flight API Routes ---

app.get('/api/hotels/search', verifyToken, async (req, res) => {
    // In a real app, you'd use the query params to search a hotel database or API.
    // For this demo, we'll return mock data.
    const mockHotels = [
        { id: 1, name: 'The Taj Mahal Palace', city: 'Mumbai', rating: 5, price_per_night: 15000, currency: 'INR' },
        { id: 2, name: 'The Oberoi', city: 'Delhi', rating: 5, price_per_night: 12000, currency: 'INR' },
        { id: 3, name: 'The Leela Palace', city: 'Bangalore', rating: 5, price_per_night: 10000, currency: 'INR' },
    ];
    res.json(mockHotels);
});

app.post('/api/hotels/book', verifyToken, async (req, res) => {
    const { hotel, room, bookingDetails } = req.body;
    const agentId = req.userId;

    if (!hotel || !room || !bookingDetails) {
        return res.status(400).json({ message: 'Hotel, room, and booking details are required.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Check agent's balance
        const [agentRows] = await connection.execute('SELECT wallet_balance FROM users WHERE id = ?', [agentId]);
        const agent = agentRows[0];
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found.' });
        }

        const totalCost = room.price * bookingDetails.nights;
        if (agent.wallet_balance < totalCost) {
            return res.status(400).json({ message: 'Insufficient wallet balance.' });
        }

        // 2. Deduct from wallet
        const newBalance = agent.wallet_balance - totalCost;
        await connection.execute('UPDATE users SET wallet_balance = ? WHERE id = ?', [newBalance, agentId]);

        // 3. Create the booking record
        const confirmationId = `HOTEL${Date.now()}`; // Simple confirmation ID
        const bookingStatus = 'confirmed';
        const [bookingResult] = await connection.execute(
            `INSERT INTO bookings (user_id, booking_type, status, total_amount, currency, confirmation_id, hotel_details)
             VALUES (?, 'hotel', ?, ?, ?, ?, ?)`,
            [agentId, bookingStatus, totalCost, room.currency, confirmationId, JSON.stringify({ hotel, room, bookingDetails })]
        );
        const bookingId = bookingResult.insertId;

        // 4. Log the transaction
        await connection.execute(
            `INSERT INTO transactions (user_id, type, amount, currency, related_booking_id)
             VALUES (?, 'debit', ?, ?, ?)`,
            [agentId, totalCost, room.currency, bookingId]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Hotel booking confirmed successfully!',
            confirmationId: confirmationId,
            bookingId: bookingId,
        });

    } catch (error) {
        await connection.rollback();
        console.error('Hotel booking error:', error);
        res.status(500).json({ message: 'An internal error occurred during hotel booking.' });
    } finally {
        connection.release();
    }
});

app.get('/api/flights/search', async (req, res) => {
    const { origin, destination, tripType } = req.query;

    // In a real app, you'd use the query params to search a flight database or API.
    // For this demo, we'll filter mock data.
    const mockFlights = [
        // Existing mock data...
        { id: 1, airline: 'IndiGo', flightNumber: '6E 204', origin: 'DEL', destination: 'BOM', departure: '2024-08-01T08:00:00', arrival: '2024-08-01T10:00:00', duration: '2h 0m', stops: 'Non-stop', price: 4500, currency: 'INR' },
        { id: 2, airline: 'Vistara', flightNumber: 'UK 996', origin: 'DEL', destination: 'BOM', departure: '2024-08-01T09:30:00', arrival: '2024-08-01T11:35:00', duration: '2h 5m', stops: 'Non-stop', price: 5200, currency: 'INR' },
        { id: 3, airline: 'Air India', flightNumber: 'AI 805', origin: 'DEL', destination: 'BOM', departure: '2024-08-01T11:00:00', arrival: '2024-08-01T13:00:00', duration: '2h 0m', stops: 'Non-stop', price: 4800, currency: 'INR' },
        { id: 4, airline: 'SpiceJet', flightNumber: 'SG 871', origin: 'DEL', destination: 'BOM', departure: '2024-08-01T14:00:00', arrival: '2024-08-01T16:15:00', duration: '2h 15m', stops: 'Non-stop', price: 4300, currency: 'INR' },
        { id: 5, airline: 'IndiGo', flightNumber: '6E 555', origin: 'DEL', destination: 'BOM', departure: '2024-08-01T16:30:00', arrival: '2024-08-01T18:30:00', duration: '2h 0m', stops: 'Non-stop', price: 4650, currency: 'INR' },
        { id: 6, airline: 'Vistara', flightNumber: 'UK 951', origin: 'DEL', destination: 'BOM', departure: '2024-08-01T18:00:00', arrival: '2024-08-01T20:10:00', duration: '2h 10m', stops: 'Non-stop', price: 5500, currency: 'INR' },
        { id: 7, airline: 'Air India', flightNumber: 'AI 665', origin: 'DEL', destination: 'BOM', departure: '2024-08-01T20:30:00', arrival: '2024-08-01T22:30:00', duration: '2h 0m', stops: 'Non-stop', price: 5100, currency: 'INR' },
        { id: 8, airline: 'IndiGo', flightNumber: '6E 2041', origin: 'DEL', destination: 'BOM', departure: '2024-08-01T06:00:00', arrival: '2024-08-01T09:15:00', duration: '3h 15m', stops: '1 Stop', price: 6200, currency: 'INR' },
        { id: 9, airline: 'Vistara', flightNumber: 'UK 888', origin: 'DEL', destination: 'BOM', departure: '2024-08-01T12:00:00', arrival: '2024-08-01T16:00:00', duration: '4h 0m', stops: '1 Stop', price: 5800, currency: 'INR' },
        // Return flights (BOM to DEL)
        { id: 10, airline: 'IndiGo', flightNumber: '6E 205', origin: 'BOM', destination: 'DEL', departure: '2024-08-08T08:00:00', arrival: '2024-08-08T10:00:00', duration: '2h 0m', stops: 'Non-stop', price: 4700, currency: 'INR' },
        { id: 11, airline: 'Vistara', flightNumber: 'UK 997', origin: 'BOM', destination: 'DEL', departure: '2024-08-08T09:30:00', arrival: '2024-08-08T11:35:00', duration: '2h 5m', stops: 'Non-stop', price: 5400, currency: 'INR' },
        { id: 12, airline: 'Air India', flightNumber: 'AI 806', origin: 'BOM', destination: 'DEL', departure: '2024-08-08T11:00:00', arrival: '2024-08-08T13:00:00', duration: '2h 0m', stops: 'Non-stop', price: 5000, currency: 'INR' },
        { id: 13, airline: 'IndiGo', flightNumber: '6E 2042', origin: 'BOM', destination: 'DEL', departure: '2024-08-08T06:00:00', arrival: '2024-08-08T09:15:00', duration: '3h 15m', stops: '1 Stop', price: 6400, currency: 'INR' },
    ];

    // Case-insensitive filtering
    const outboundFlights = mockFlights.filter(
        f => f.origin.toLowerCase() === origin.toLowerCase() && f.destination.toLowerCase() === destination.toLowerCase()
    );

    let returnFlights = [];
    if (tripType === 'round-trip') {
        returnFlights = mockFlights.filter(
            f => f.origin.toLowerCase() === destination.toLowerCase() && f.destination.toLowerCase() === origin.toLowerCase()
        );
    }

    res.json({
        outboundFlights,
        returnFlights
    });
});

app.post('/api/flights/book', verifyToken, async (req, res) => {
    const { flight, passengers } = req.body;
    const agentId = req.userId;

    if (!flight || !passengers || passengers.length === 0) {
        return res.status(400).json({ message: 'Flight and passenger details are required.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Check agent's balance
        const [agentRows] = await connection.execute('SELECT wallet_balance FROM users WHERE id = ?', [agentId]);
        const agent = agentRows[0];
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found.' });
        }

        const totalCost = flight.price * passengers.length;
        if (agent.wallet_balance < totalCost) {
            return res.status(400).json({ message: 'Insufficient wallet balance.' });
        }

        // 2. Deduct from wallet
        const newBalance = agent.wallet_balance - totalCost;
        await connection.execute('UPDATE users SET wallet_balance = ? WHERE id = ?', [newBalance, agentId]);

        // 3. Create the booking record
        const pnr = `B2B${Date.now()}`; // Simple PNR generation
        const bookingStatus = 'confirmed';
        const [bookingResult] = await connection.execute(
            `INSERT INTO bookings (user_id, booking_type, status, total_amount, currency, pnr, flight_details)
             VALUES (?, 'flight', ?, ?, ?, ?, ?)`,
            [agentId, bookingStatus, totalCost, flight.currency, pnr, JSON.stringify({ flight, passengers })]
        );
        const bookingId = bookingResult.insertId;

        // 4. Log the transaction
        await connection.execute(
            `INSERT INTO transactions (user_id, type, amount, currency, related_booking_id)
             VALUES (?, 'debit', ?, ?, ?)`,
            [agentId, totalCost, flight.currency, bookingId]
        );

        await connection.commit();

        // In a real scenario, you would generate a proper e-ticket PDF here.
        // For now, we'll just return a success message.
        res.status(201).json({
            message: 'Booking confirmed successfully!',
            pnr: pnr,
            bookingId: bookingId,
            eticketUrl: `/api/bookings/${bookingId}/eticket`
        });

    } catch (error) {
        await connection.rollback();
        console.error('Booking error:', error);
        res.status(500).json({ message: 'An internal error occurred during booking.' });
    } finally {
        connection.release();
    }
});

// --- Authentication API Routes ---
app.post(
  '/api/auth/register',
  [
    body('name', 'Name is required').not().isEmpty().trim().escape(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 8 characters long').isLength({ min: 8 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role = 'agent' } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 8);
      
      // Set initial wallet balance for agents
      const initialWalletBalance = role === 'agent' ? 1000.00 : 0.00;

      const [result] = await pool.execute(
        'INSERT INTO users (email, password_hash, name, role, kyc_status, wallet_balance) VALUES (?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, name, role, 'none', initialWalletBalance]
      );
      res.status(201).send({ message: 'User registered successfully!', userId: result.insertId });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).send({ message: 'Email already exists.' });
      }
      console.error('Registration error:', error);
      res.status(500).send({ message: 'Failed to register user.' });
    }
  }
);

app.post('/api/auth/login',
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').not().isEmpty()
  ],
  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).send({ message: 'User not found.' });
    }
    const user = rows[0];
    const passwordIsValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordIsValid) {
      return res.status(401).send({ accessToken: null, message: 'Invalid Password!' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: 86400 });
    res.status(200).send({ id: user.id, name: user.name, role: user.role, accessToken: token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send({ message: 'Error logging in.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      // Security measure: Don't reveal if an email is registered or not.
      return res.status(200).send({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const user = users[0];

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expirationDate = new Date(Date.now() + 3600000); // 1 hour

    await pool.execute(
      'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
      [hashedToken, expirationDate, user.id]
    );

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Request',
      html: generatePasswordResetEmail({ resetUrl })
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      res.status(200).send({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (emailError) {
      console.error('[Forgot Password] Error sending email:', emailError);
      // Even if email fails, we don't want to leak information to the client.
      // The internal log is what matters for debugging.
      res.status(200).send({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
  } catch (error) {
    console.error('[Forgot Password] General error:', error);
    res.status(500).send({ message: 'An error occurred while processing your request.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).send({ message: 'Token and new password are required.' });
  }
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
      [hashedToken]
    );
    if (users.length === 0) {
      return res.status(400).send({ message: 'Password reset token is invalid or has expired.' });
    }
    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 8);
    await pool.execute(
      'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );
    res.status(200).send({ message: 'Password has been updated successfully.' });
  } catch (error) {
    console.error('Reset Password error:', error);
    res.status(500).send({ message: 'An error occurred while resetting your password.' });
  }
});

// --- Server Start ---

app.get('/api/bookings', verifyToken, async (req, res) => {
    try {
        const [bookings] = await pool.execute(
            `SELECT 
                b.id,
                b.pnr,
                b.booking_type,
                b.booking_date,
                b.total_amount,
                b.status,
                COALESCE(r.status, 'none') AS refund_status,
                b.currency
            FROM bookings b
            LEFT JOIN refunds r ON b.id = r.booking_id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC`,
            [req.userId]
        );
        res.json(bookings);
    } catch (error) {
        console.error('Fetch bookings error:', error);
        res.status(500).json({ message: 'Failed to fetch bookings.' });
    }
});

app.post('/api/bookings/:bookingId/refund', verifyToken, async (req, res) => {
    const { bookingId } = req.params;

    try {
        // Check if a refund request already exists
        const [existing] = await pool.execute(
            'SELECT * FROM refunds WHERE booking_id = ?',
            [bookingId]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'A refund request for this booking already exists.' });
        }

        // For simplicity, we'll find the booking to get the amount.
        const [bookings] = await pool.execute('SELECT total_amount, currency FROM bookings WHERE id = ? AND user_id = ?', [bookingId, req.userId]);
        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found or you do not have permission to access it.' });
        }

        await pool.execute(
            `INSERT INTO refunds (booking_id, user_id, status, refund_amount, currency)
             VALUES (?, ?, 'pending', ?, ?)`,
            [bookingId, req.userId, bookings[0].total_amount, bookings[0].currency]
        );

        res.status(201).json({ message: 'Refund requested successfully. It is now pending approval.' });
    } catch (error) {
        console.error('Refund request error:', error);
        res.status(500).json({ message: 'Failed to request refund.' });
    }
});

// --- E-Ticket Generation ---
const generateETicketHTML = (booking) => {
    // This is a simplified HTML template. A real one would be much more styled.
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>E-Ticket</title>
            <style>
                body { font-family: sans-serif; margin: 20px; }
                .ticket { border: 1px solid #ccc; padding: 20px; max-width: 600px; margin: auto; }
                h1 { color: #333; }
                .details { margin-top: 20px; }
                .details p { margin: 5px 0; }
            </style>
        </head>
        <body>
            <div class="ticket">
                <h1>E-Ticket / Itinerary</h1>
                <p><strong>PNR:</strong> ${booking.pnr}</p>
                <div class="details">
                    <h2>Flight Details</h2>
                    <p><strong>Airline:</strong> ${booking.flight_details.airline}</p>
                    <p><strong>Flight Number:</strong> ${booking.flight_details.flightNumber}</p>
                    <p><strong>From:</strong> ${booking.flight_details.origin} <strong>To:</strong> ${booking.flight_details.destination}</p>
                    <p><strong>Departure:</strong> ${new Date(booking.flight_details.departure).toLocaleString()}</p>
                    <p><strong>Arrival:</strong> ${new Date(booking.flight_details.arrival).toLocaleString()}</p>
                </div>
                <div class="details">
                    <h2>Passenger Details</h2>
                    ${booking.passengers.map(p => `<p>${p.title} ${p.firstName} ${p.lastName}</p>`).join('')}
                </div>
            </div>
        </body>
        </html>
    `;
};

app.get('/api/bookings/:bookingId/eticket', verifyToken, async (req, res) => {
    const { bookingId } = req.params;
    try {
        const [bookingRows] = await pool.execute(
            'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
            [bookingId, req.userId]
        );
        if (bookingRows.length === 0) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        const booking = {
            ...bookingRows[0],
            flight_details: JSON.parse(bookingRows[0].flight_details),
            passengers: JSON.parse(bookingRows[0].flight_details).passengers
        };

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const htmlContent = generateETicketHTML(booking);
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=e-ticket-${booking.pnr}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('E-ticket generation error:', error);
        res.status(500).json({ message: 'Failed to generate e-ticket.' });
    }
});

// --- Admin API Routes ---
app.get('/api/admin/agents', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [agents] = await pool.execute(`
            SELECT
                u.id,
                u.name,
                u.email,
                u.kyc_status,
                JSON_OBJECT('documentType', kd.document_type, 'fileName', kd.file_name) as kyc_details
            FROM
                users u
            LEFT JOIN
                (
                    SELECT
                        *,
                        ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY submitted_at DESC) as rn
                    FROM
                        kyc_documents
                ) kd ON u.id = kd.user_id AND kd.rn = 1
            WHERE
                u.role = 'agent'
        `);
        res.json(agents);
    } catch (error) {
        console.error('Failed to fetch agents:', error);
        res.status(500).json({ message: 'Failed to fetch agents.' });
    }
});

app.get('/api/admin/bookings', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [bookings] = await pool.execute(`
            SELECT b.id, b.pnr, u.name as agent_name, b.booking_type, b.booking_date, b.total_amount, b.status 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            ORDER BY b.booking_date DESC
        `);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookings.' });
    }
});

app.get('/api/admin/kyc-submissions', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [submissions] = await pool.execute(`
            SELECT id, name, email, kyc_status, kyc_details 
            FROM users 
            WHERE kyc_status = 'pending'
            ORDER BY created_at DESC
        `);
        res.json(submissions);
    } catch (error) {
        console.error('Admin KYC fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch KYC submissions.' });
    }
});

app.put('/api/admin/kyc/:userId', verifyToken, verifyAdmin, async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' });
    }

    try {
        await pool.execute(
            'UPDATE users SET kyc_status = ? WHERE id = ?',
            [status, userId]
        );
        res.json({ message: `KYC status for user ${userId} has been updated to ${status}.` });
    } catch (error) {
        console.error('Admin KYC update error:', error);
        res.status(500).json({ message: 'Failed to update KYC status.' });
    }
});



app.post('/admin/kyc/request-resubmission', verifyToken, verifyAdmin, async (req, res) => {
    const { userId } = req.body;
    try {
        await pool.execute(
            "UPDATE users SET kyc_status = 'resubmission_requested' WHERE id = ?",
            [userId]
        );
        // Here you could also trigger an email to the user.
        res.json({ message: 'Resubmission requested successfully.' });
    } catch (error) {
        console.error('KYC resubmission request error:', error);
        res.status(500).json({ message: 'Failed to request resubmission.' });
    }
});



app.get('/api/admin/refunds', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [refunds] = await pool.execute(`
            SELECT 
                r.id, 
                r.booking_id, 
                b.booking_type, 
                u.name AS agent_name, 
                r.status, 
                r.request_date,
                r.refund_amount,
                r.currency
            FROM refunds r
            JOIN users u ON r.user_id = u.id
            JOIN bookings b ON r.booking_id = b.id
            ORDER BY r.request_date DESC
        `);
        res.json(refunds);
    } catch (error) {
        console.error('Admin refunds fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch refund requests.' });
    }
});

app.put('/api/admin/refunds/:refundId', verifyToken, verifyAdmin, async (req, res) => {
    const { refundId } = req.params;
    const { status, admin_notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get refund details
        const [refundRows] = await connection.execute('SELECT * FROM refund_requests WHERE id = ?', [refundId]);
        if (refundRows.length === 0) {
            return res.status(404).json({ message: 'Refund request not found.' });
        }
        const refund = refundRows[0];

        if (refund.status !== 'pending') {
            return res.status(400).json({ message: `This refund request has already been ${refund.status}.` });
        }

        // 2. Update the refund request
        await connection.execute(
            'UPDATE refund_requests SET status = ?, admin_notes = ?, resolution_date = NOW() WHERE id = ?',
            [status, admin_notes, refundId]
        );

        // 3. If approved, credit the agent's wallet
        if (status === 'approved') {
            await connection.execute(
                'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
                [refund.refund_amount, refund.agent_id]
            );
            // Log the credit transaction
            await connection.execute(
                `INSERT INTO wallet_transactions (agent_id, amount, type, status, related_entity_id, related_entity_type)
                 VALUES (?, ?, 'credit', 'completed', ?, 'refund')`,
                [refund.agent_id, refund.refund_amount, refund.id]
            );
        }

        await connection.commit();
        res.json({ message: `Refund has been successfully ${status}.` });

    } catch (error) {
        await connection.rollback();
        console.error('Refund processing error:', error);
        res.status(500).json({ message: 'An internal error occurred while processing the refund.' });
    } finally {
        connection.release();
    }
});

// Mock data for analytics
const analyticsData = [
  { name: 'Jan', sales: 4000, bookings: 24 },
  { name: 'Feb', sales: 3000, bookings: 13 },
  // ... more data
];

app.get('/api/admin/analytics', verifyToken, verifyAdmin, (req, res) => {
  res.json(analyticsData);
});

// Mock data for commissions
let commissionRates = {
  flight_commission_rate: 5.0,
  hotel_commission_rate: 10.0,
};

app.get('/api/admin/commissions', verifyToken, verifyAdmin, (req, res) => {
  res.json(commissionRates);
});

app.post('/api/admin/commissions', verifyToken, verifyAdmin, (req, res) => {
  const { flight_commission_rate, hotel_commission_rate } = req.body;
  commissionRates = {
    flight_commission_rate,
    hotel_commission_rate,
  };
  res.json({ message: 'Commission rates updated successfully.' });
});

// Mock data for support tickets
const supportTickets = [
  { id: 'TKT123', subject: 'Login Issue', agent: 'Test Agent', status: 'Open' },
  { id: 'TKT124', subject: 'Booking Failed', agent: 'Another Agent', status: 'Closed' },
];

app.get('/api/admin/tickets', verifyToken, verifyAdmin, (req, res) => {
  res.json(supportTickets);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Connected to database:', dbConfig.database);
});