const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password and role are required.' });
    }

    let table;
    if (role === 'admin')       table = 'Admins';
    else if (role === 'doctor') table = 'Doctors';
    else if (role === 'patient') table = 'Patients';
    else return res.status(400).json({ error: 'Invalid role.' });

    const [rows] = await db.query(`SELECT * FROM ${table} WHERE Email = ?`, [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, age, gender, phone, city, blood_group } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const [existing] = await db.query('SELECT PatientId FROM Patients WHERE Email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO Patients (Name, Email, Password, Age, Gender, Phone, City, BloodGroup, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [name, email, hashedPassword, age || null, gender || null, phone || '', city || '', blood_group || '']
    );

    const token = jwt.sign(
      { id: result.insertId, email, role: 'patient', name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: 'patient',
      },
      message: 'Account created successfully!',
    });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
    res.status(500).json({ error: 'Server error.' });
  }
};
