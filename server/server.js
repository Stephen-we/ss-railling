require('dotenv').config();
console.log("Loaded EMAIL_USER:", process.env.EMAIL_USER);
console.log("Loaded EMAIL_PASS:", process.env.EMAIL_PASS ? "Defined" : "Undefined");
console.log("Loaded EMAIL_RECEIVER:", process.env.EMAIL_RECEIVER);
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Debug: Log environment variable to confirm .env is working
console.log("Loaded EMAIL_USER:", process.env.EMAIL_USER);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (req, res) => {
  res.send("Backend API is running.");
});

// Test endpoint
app.get("/api/services", (req, res) => {
  res.json([
    { id: 1, title: "Service 1", description: "From backend" },
    { id: 2, title: "Service 2", description: "From backend" }
  ]);
});

// Email endpoint
app.post('/send-email', async (req, res) => {
  const { name, email, phone, message } = req.body;
  console.log("Received form data:", req.body); // Debug

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false,
      message: 'Name, email, and message are required' 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: `New Contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Contact</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line; padding: 10px; background: #f5f5f5;">${message}</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId); // Success log
    res.status(200).json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Email Error:', error.stack); // Log the full error stack
    res.status(500).json({ 
      success: false,
      message: 'Server error while sending email',
      error: error.stack  // Send the full error stack in the response for debugging
    });
  }
  
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
