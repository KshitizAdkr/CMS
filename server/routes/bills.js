// Bill Routes 
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/bills
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT b.*, p.Name AS PatientName, p.Phone AS PatientPhone
      FROM Bills b
      JOIN Patients p ON b.PatientId = p.PatientId
    `;
    const params = [];

    if (req.user.role === 'patient') {
      query += ' WHERE b.PatientId = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY b.IssuedAt DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/bills
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { patient_id, appointment_id, amount, status } = req.body;
    const [result] = await db.query(
      `INSERT INTO Bills (PatientId, ApptId, Amount, Status)
       VALUES (?, ?, ?, ?)`,
      [patient_id, appointment_id || null, amount, status || 'Pending']
    );
    res.status(201).json({ id: result.insertId, message: 'Invoice created.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/bills/:id
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { patient_id, amount, status } = req.body;
    const [result] = await db.query(
      `UPDATE Bills SET PatientId=?, Amount=?, Status=?
       WHERE BillId=?`,
      [patient_id, amount, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Bill not found.' });
    res.json({ message: 'Bill updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/bills/:id
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Bills WHERE BillId = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Bill not found.' });
    res.json({ message: 'Bill deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
