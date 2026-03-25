// ─── Doctor Routes ───
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/doctors — list all (Lab Q1: SELECT * FROM Doctors)
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, dep.Name as DepartmentName
      FROM Doctors d
      LEFT JOIN Departments dep ON d.DeptId = dep.DeptId
      ORDER BY d.DoctorId
    `);
    // Remove Password from response
    const doctors = rows.map(({ password, ...rest }) => rest);
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/doctors/:id ; single doctor
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, dep.Name as DepartmentName
      FROM Doctors d
      LEFT JOIN Departments dep ON d.DeptId = dep.DeptId
      WHERE d.DoctorId = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Doctor not found.' });
    const { password, ...doctor } = rows[0];
    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/doctors — add new (INSERT INTO Doctors)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, phone, specialization, salary, city, department_id } = req.body;
    const hashedPassword = await bcrypt.hash('doc123', 10);
    const [result] = await db.query(
      `INSERT INTO Doctors (Name, Email, Password, Phone, Specialization, Salary, City, DeptId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, specialization, salary || 0, city, department_id || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Doctor added successfully.' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists.' });
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/doctors/:id — update
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, phone, specialization, salary, city, department_id } = req.body;
    const [result] = await db.query(
      `UPDATE Doctors SET Name=?, Email=?, Phone=?, Specialization=?, Salary=?, City=?, DeptId=?
       WHERE DoctorId=?`,
      [name, email, phone, specialization, salary, city, department_id || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Doctor not found.' });
    res.json({ message: 'Doctor updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/doctors/:id
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Doctors WHERE DoctorId = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Doctor not found.' });
    res.json({ message: 'Doctor deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
