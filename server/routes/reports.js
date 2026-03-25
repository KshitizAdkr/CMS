//  Reports Routes 
// Aggregates, Joins, Subqueries
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/reports/revenue — SUM(Amount) GROUP BY month
router.get('/revenue', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        strftime('%Y-%m', IssuedAt) AS month,
        SUM(Amount) AS total_invoiced,
        COUNT(*) AS invoice_count
      FROM Bills
      GROUP BY strftime('%Y-%m', IssuedAt)
      ORDER BY month DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/reports/patients-monthly — patient registrations
router.get('/patients-monthly', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT City AS month, COUNT(*) AS count
      FROM Patients
      GROUP BY City
      ORDER BY count DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/reports/doctor-workload — Doctor workload with total appointments
router.get('/doctor-workload', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Lab Q28 pattern
    const [rows] = await db.query(`
      SELECT
        d.DoctorId, d.Name, d.Specialization,
        COUNT(a.AppointmentId) AS total,
        SUM(CASE WHEN a.Status = 'Completed' THEN 1 ELSE 0 END) AS done,
        SUM(CASE WHEN a.Status != 'Completed' THEN 1 ELSE 0 END) AS pending
      FROM Doctors d
      LEFT JOIN Appointments a ON d.DoctorId = a.DoctorId
      GROUP BY d.DoctorId, d.Name, d.Specialization
      ORDER BY total DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/reports/billing-summary
router.get('/billing-summary', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [[totals]] = await db.query(`
      SELECT
        SUM(Amount) AS total_invoiced,
        SUM(CASE WHEN Status = 'Paid' THEN Amount ELSE 0 END) AS total_collected,
        SUM(CASE WHEN Status = 'Pending' THEN Amount ELSE 0 END) AS total_pending,
        COUNT(*) AS total_invoices,
        SUM(CASE WHEN Status = 'Paid' THEN 1 ELSE 0 END) AS paid_count,
        SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) AS pending_count
      FROM Bills
    `);
    res.json(totals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/reports/city-distribution — Patients by City
router.get('/city-distribution', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT City, COUNT(*) AS count
      FROM Patients
      GROUP BY City
      ORDER BY count DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/reports/departments
router.get('/departments', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Departments ORDER BY DeptId');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
