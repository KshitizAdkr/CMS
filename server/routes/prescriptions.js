// Prescription Routes 
// Prescription details with Patient and Doctor name (INNER JOIN)
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/prescriptions — Prescription details JOIN
router.get('/', authenticate, async (req, res) => {
  try {
    // Prescription details with Patient and Doctor name
    let query = `
      SELECT
        pr.PrescriptionId, pr.AppointmentId, pr.Medicine, pr.Dosage, pr.Duration, pr.Notes,
        a.PatientId, a.DoctorId, a.AppDate AS AppointmentDate,
        p.Name AS PatientName,
        d.Name AS DoctorName
      FROM Prescriptions pr
      INNER JOIN Appointments a ON pr.AppointmentId = a.AppointmentId
      INNER JOIN Patients     p ON a.PatientId      = p.PatientId
      INNER JOIN Doctors      d ON a.DoctorId       = d.DoctorId
    `;
    const params = [];

    // Filter by appointment_id if provided
    if (req.query.appointment_id) {
      query += ' WHERE pr.AppointmentId = ?';
      params.push(req.query.appointment_id);
    } else if (req.user.role === 'doctor') {
      query += ' WHERE a.DoctorId = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'patient') {
      query += ' WHERE a.PatientId = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY pr.PrescriptionId DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/prescriptions — INSERT INTO Prescriptions
router.post('/', authenticate, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const { appointment_id, medicine, dosage, duration, notes } = req.body;

    // Doctor can only add prescriptions for their appointments
    if (req.user.role === 'doctor') {
      const [appt] = await db.query('SELECT * FROM Appointments WHERE AppointmentId = ? AND DoctorId = ?', [appointment_id, req.user.id]);
      if (appt.length === 0) return res.status(403).json({ error: 'Not your appointment.' });
    }

    const [result] = await db.query(
      `INSERT INTO Prescriptions (AppointmentId, Medicine, Dosage, Duration, Notes)
       VALUES (?, ?, ?, ?, ?)`,
      [appointment_id, medicine, dosage, duration, notes]
    );
    res.status(201).json({ id: result.insertId, message: 'Prescription added.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/prescriptions/:id
router.put('/:id', authenticate, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const { medicine, dosage, duration, notes } = req.body;
    const [result] = await db.query(
      `UPDATE Prescriptions SET Medicine=?, Dosage=?, Duration=?, Notes=? WHERE PrescriptionId=?`,
      [medicine, dosage, duration, notes, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Prescription not found.' });
    res.json({ message: 'Prescription updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/prescriptions/:id -  DELETE FROM Prescriptions
router.delete('/:id', authenticate, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Prescriptions WHERE PrescriptionId = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Prescription not found.' });
    res.json({ message: 'Prescription deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
