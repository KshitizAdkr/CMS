// Patient Routes 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/patients (SELECT * FROM Patients)
router.get('/', authenticate, async (req, res) => {
  try {
    // Patients can only see their own profile
    if (req.user.role === 'patient') {
      const [rows] = await db.query('SELECT * FROM Patients WHERE PatientId = ?', [req.user.id]);
      const patients = rows.map(({ password, ...rest }) => rest);
      return res.json(patients);
    }
    const [rows] = await db.query('SELECT * FROM Patients ORDER BY PatientId');
    const patients = rows.map(({ password, ...rest }) => rest);
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/patients/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Patients can only view their own profile
    if (req.user.role === 'patient' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const [rows] = await db.query('SELECT * FROM Patients WHERE PatientId = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Patient not found.' });
    const { password, ...patient } = rows[0];
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/patients (INSERT INTO Patients)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, age, gender, phone, city, blood_group, status } = req.body;
    const hashedPassword = await bcrypt.hash('patient123', 10);
    const [result] = await db.query(
      `INSERT INTO Patients (Name, Email, Password, Age, Gender, Phone, City, BloodGroup, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, age, gender, phone, city, blood_group, status || 'active']
    );
    res.status(201).json({ id: result.insertId, message: 'Patient registered successfully.' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists.' });
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/patients/:id (UPDATE Patients SET Phone = ?)
// Patients can update their own profile; admins can update any patient
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Patients can only update their own profile
    if (req.user.role === 'patient' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    // Non-admin, non-patient roles cannot update
    if (req.user.role !== 'admin' && req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Access forbidden for this role.' });
    }

    const { name, email, age, gender, phone, city, blood_group, status } = req.body;
    // Patients cannot change their own status
    const finalStatus = req.user.role === 'patient' ? undefined : status;
    
    const [result] = await db.query(
      `UPDATE Patients SET Name=?, Email=?, Age=?, Gender=?, Phone=?, City=?, BloodGroup=?${finalStatus !== undefined ? ', Status=?' : ''}
       WHERE PatientId=?`,
      finalStatus !== undefined
        ? [name, email, age, gender, phone, city, blood_group, finalStatus, req.params.id]
        : [name, email, age, gender, phone, city, blood_group, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Patient not found.' });
    res.json({ message: 'Patient updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/patients/:id (DELETE FROM Patients WHERE PatientId = ?)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Patients WHERE PatientId = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Patient not found.' });
    res.json({ message: 'Patient deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
