require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://kashish-frontend.vercel.app'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("Backend API is running.");
});

app.get("/api/services", (req, res) => {
  res.json([
    { id: 1, title: "Service 1", description: "From backend" },
    { id: 2, title: "Service 2", description: "From backend" }
  ]);
});

app.post('/send-email', async (req, res) => {
  const { name, email, phone, message } = req.body;

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
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line; padding: 10px; background: #f5f5f5;">${message}</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    res.status(200).json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Email Error:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error while sending email'
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
