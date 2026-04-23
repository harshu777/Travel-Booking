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
import crypto from 'crypto';
import bodyParser from 'body-parser';

const app = express();
const port = 3001;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Multer Configuration ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// b2b_user
// --- Database Configuration ---
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Your MySQL password
  database: 'b2b_travel_booking_platform'
};
const JWT_SECRET = '641732b01d47293b26c0ca00bd8ffec6d29c14f2460bd0210654dfa7f164ff027fa314d56755794de99b8602e68217cc4eea94f1540de11270efb7bfb2fb7b4e';

// --- Email Transport ---
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- Database Connection Pool ---
const pool = mysql.createPool(dbConfig);

// --- JWT Verification Middleware ---
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('Token:', token);
  if (!token) {
    return res.status(403).send({ message: 'No token provided.' });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT Error:', err);
      return res.status(401).send({ message: 'Unauthorized: Invalid Token.' });
    }
    console.log('Decoded Token:', decoded);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// --- Admin Verification Middleware ---
const verifyAdmin = (req, res, next) => {
  console.log('User Role:', req.userRole);
  if (req.userRole !== 'admin') {
    return res.status(403).send({ message: "Forbidden: Requires Admin Role!" });
  }
  next();
};

// --- Temporary Test Endpoint ---
app.get('/api/test-balance/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[Test API] Received request for user ID: ${id}`);
    try {
        const [rows] = await pool.execute('SELECT wallet_balance, name, email FROM users WHERE id = ?', [id]);
        if (rows.length > 0) {
            console.log(`[Test API] Database returned:`, rows[0]);
            res.render('test', { message: 'Test successful', data: rows[0] });
        } else {
            console.log(`[Test API] User not found for ID: ${id}`);
            res.status(404).render('error', { message: 'Test failed: User not found' });
        }
    } catch (error) {
        console.error('[Test API] Error:', error);
        res.status(500).render('error', { message: 'Test failed: Server error' });
    }
});

// --- User API Routes