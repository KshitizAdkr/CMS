// Dashboard Stats Route 
// COUNT(*), SUM()
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Lab Q14: Total number of patients
    const [[{ totalPatients }]] = await db.query('SELECT COUNT(*) AS totalPatients FROM Patients');
    // Lab Q13: Total number of doctors
    const [[{ totalDoctors }]]  = await db.query('SELECT COUNT(*) AS totalDoctors FROM Doctors');
    const [[{ totalAppts }]]    = await db.query('SELECT COUNT(*) AS totalAppts FROM Appointments');

    // Lab Q19: Number of appointments per status
    const [[{ scheduled }]]     = await db.query("SELECT COUNT(*) AS scheduled FROM Appointments WHERE Status = 'Scheduled'");
    const [[{ completed }]]     = await db.query("SELECT COUNT(*) AS completed FROM Appointments WHERE Status = 'Completed'");
    const [[{ cancelled }]]     = await db.query("SELECT COUNT(*) AS cancelled FROM Appointments WHERE Status = 'Cancelled'");

    const [[{ totalRevenue }]]  = await db.query("SELECT COALESCE(SUM(Amount), 0) AS totalRevenue FROM Bills WHERE Status = 'Paid'");

    // Recent appointments
    const [recentAppts] = await db.query(`
      SELECT a.AppointmentId, a.AppDate, a.AppTime, a.Status, a.Reason,
        p.Name AS PatientName,
        d.Name AS DoctorName, d.Specialization
      FROM Appointments a
      INNER JOIN Patients p ON a.PatientId = p.PatientId
      INNER JOIN Doctors  d ON a.DoctorId  = d.DoctorId
      ORDER BY a.AppointmentId DESC LIMIT 5
    `);

    res.json({
      totalPatients,
      totalDoctors,
      totalAppts,
      scheduled,
      completed,
      cancelled,
      totalRevenue,
      recentAppts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/dashboard/patient-stats; Patient's own dashboard
router.get('/patient-stats', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Access forbidden.' });
    }
    const pid = req.user.id;

    const [[{ totalAppts }]] = await db.query(
      'SELECT COUNT(*) AS totalAppts FROM Appointments WHERE PatientId = ?', [pid]);
    const [[{ scheduled }]] = await db.query(
      "SELECT COUNT(*) AS scheduled FROM Appointments WHERE PatientId = ? AND Status = 'Scheduled'", [pid]);
    const [[{ completed }]] = await db.query(
      "SELECT COUNT(*) AS completed FROM Appointments WHERE PatientId = ? AND Status = 'Completed'", [pid]);
    const [[{ totalPrescriptions }]] = await db.query(
      'SELECT COUNT(*) AS totalPrescriptions FROM Prescriptions WHERE AppointmentId IN (SELECT AppointmentId FROM Appointments WHERE PatientId = ?)', [pid]);
    const [[{ totalBills }]] = await db.query(
      'SELECT COUNT(*) AS totalBills FROM Bills WHERE PatientId = ?', [pid]);
    const [[{ pendingAmount }]] = await db.query(
      "SELECT COALESCE(SUM(Amount), 0) AS pendingAmount FROM Bills WHERE PatientId = ? AND Status = 'Pending'", [pid]);
    const [[{ paidAmount }]] = await db.query(
      "SELECT COALESCE(SUM(Amount), 0) AS paidAmount FROM Bills WHERE PatientId = ? AND Status = 'Paid'", [pid]);

    // Upcoming appointments
    const [upcomingAppts] = await db.query(`
      SELECT a.AppointmentId, a.AppDate, a.AppTime, a.Status, a.Reason,
        d.Name AS DoctorName, d.Specialization
      FROM Appointments a
      INNER JOIN Doctors d ON a.DoctorId = d.DoctorId
      WHERE a.PatientId = ? AND a.Status = 'Scheduled'
      ORDER BY a.AppDate, a.AppTime LIMIT 5
    `, [pid]);

    res.json({
      totalAppts, scheduled, completed, totalPrescriptions,
      totalBills, pendingAmount, paidAmount, upcomingAppts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
