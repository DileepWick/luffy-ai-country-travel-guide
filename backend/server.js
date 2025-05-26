// server.js
import express, { json } from 'express';
import { connect, model, Schema } from 'mongoose';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

import cors from 'cors';
import dotenv from 'dotenv';

import gemini_route from './gemini_route.js'; // Import the Gemini route


dotenv.config();

const app = express();
const { sign, verify } = jwt;
app.use(json());
app.use(cors());

// MongoDB connection
connect(process.env.MONGO_URI, )
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User model
const User = model('User', new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

// Signup route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  const userExists = await User.findOne({ username });
  if (userExists) return res.status(400).send('User already exists');

  // Hash the password
  const hashedPassword = await hash(password, 10);

  // Create a new user
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();

  // Generate a JWT
  const token = sign({ id: newUser._id, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({ token });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send('Invalid credentials');

  // Compare password
  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) return res.status(400).send('Invalid credentials');

  // Generate JWT token
  const token = sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

// Protected route
app.get('/protected', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Token required');

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    res.json({ message: 'This is a protected route', user: decoded });
  } catch (err) {
    res.status(401).send('Invalid or expired token');
  }
});

// Use the Gemini route
app.use('/api', gemini_route);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
