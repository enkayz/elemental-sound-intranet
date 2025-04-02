import { getDb } from '../../../data/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password, name, email, role = 'Intern' } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({ 
        message: 'Username, password, name, and email are required' 
      });
    }

    const db = await getDb();
    
    // Check if username already exists
    const existingUser = db.data.users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = db.data.users.find(u => u.email === email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with role defaulting to Intern if not specified
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      password: hashedPassword,
      name,
      email,
      role,
      created: new Date().toISOString()
    };

    // Add user to database
    db.data.users.push(newUser);
    await db.write();

    // Don't send the password back to the client
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 