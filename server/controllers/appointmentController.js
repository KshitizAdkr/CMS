const db = require('../config/db');

exports.getAllAppointments = async (req, res) => {
  try {
    let query = `
      SELECT
        a.AppointmentId AS id, a.PatientId AS patient_id, a.DoctorId AS doctor_id,
        a.AppDate AS date, a.AppTime AS time, a.Status AS status, a.Reason AS reason,
        p.Name AS patient_name, p.Phone AS patient_phone, p.BloodGroup AS blood_group,
        d.Name AS doctor_name, d.Specialization AS specialization, d.Phone AS doctor_phone
      FROM Appointments a
      INNER JOIN Patients p ON a.PatientId = p.PatientId
      INNER JOIN Doctors  d ON a.DoctorId  = d.DoctorId
    `;
    const params = [];

    if (req.user.role === 'doctor') {
      query += ' WHERE a.DoctorId = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'patient') {
      query += ' WHERE a.PatientId = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY a.AppDate DESC, a.AppTime DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        a.AppointmentId, a.PatientId, a.DoctorId,
        a.AppDate, a.AppTime, a.Status, a.Reason,
        p.Name AS PatientName, p.Phone AS PatientPhone,
        d.Name AS DoctorName, d.Specialization
      FROM Appointments a
      INNER JOIN Patients p ON a.PatientId = p.PatientId
      INNER JOIN Doctors  d ON a.DoctorId  = d.DoctorId
      WHERE a.AppointmentId = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    let { patient_id, doctor_id, date, time, status, reason } = req.body;

    if (req.user.role === 'patient') {
      patient_id = req.user.id;
      status = 'Scheduled';
    }

    if (!patient_id || !doctor_id || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const [result] = await db.query(
      `INSERT INTO Appointments (PatientId, DoctorId, AppDate, AppTime, Status, Reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, date, time, status || 'Scheduled', reason]
    );
    res.status(201).json({ id: result.insertId, message: 'Appointment booked successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, date, time, status, reason } = req.body;

    if (req.user.role === 'doctor') {
      const [existing] = await db.query('SELECT * FROM Appointments WHERE AppointmentId = ? AND DoctorId = ?', [req.params.id, req.user.id]);
      if (existing.length === 0) return res.status(403).json({ error: 'Not your appointment.' });

      await db.query('UPDATE Appointments SET Status = ? WHERE AppointmentId = ?', [status, req.params.id]);
      return res.json({ message: 'Appointment status updated.' });
    }

    const [result] = await db.query(
      `UPDATE Appointments SET PatientId=?, DoctorId=?, AppDate=?, AppTime=?, Status=?, Reason=?
       WHERE AppointmentId=?`,
      [patient_id, doctor_id, date, time, status, reason, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found.' });
    res.json({ message: 'Appointment updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Appointments WHERE AppointmentId = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found.' });
    res.json({ message: 'Appointment deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};
