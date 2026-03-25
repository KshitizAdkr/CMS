const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'medicare.db');
const db = new Database(dbPath);

const queries = [
  { name: 'MediCare Clinic - Doctors', sql: 'SELECT * FROM Doctors' },
  { name: 'MediCare Clinic - Patients', sql: 'SELECT * FROM Patients' },
  { name: 'MediCare Clinic - Appointments', sql: 'SELECT * FROM Appointments' },
  { name: 'MediCare Clinic - Prescriptions', sql: 'SELECT * FROM Prescriptions' },
  { name: 'MediCare Clinic - Bills', sql: 'SELECT * FROM Bills' },
  { name: 'MediCare Clinic - Audit Log', sql: 'SELECT * FROM MediCare_AppointmentAudit' },

  { name: 'Q23: Full appointment details (INNER JOIN)', sql: 'SELECT a.AppointmentId, p.Name AS PatientName, d.Name AS DoctorName, d.Specialization, a.AppDate, a.AppTime, a.Status, a.Reason FROM Appointments a INNER JOIN Patients p ON a.PatientId = p.PatientId INNER JOIN Doctors d ON a.DoctorId = d.DoctorId LIMIT 5' },
  { name: 'Q28: Doctor workload (LEFT JOIN & GROUP BY)', sql: 'SELECT d.Name AS DoctorName, d.Specialization, COUNT(a.AppointmentId) AS TotalAppointments FROM Doctors d LEFT JOIN Appointments a ON d.DoctorId = a.DoctorId GROUP BY d.DoctorId, d.Name, d.Specialization ORDER BY TotalAppointments DESC' },
];

for (const q of queries) {
  console.log(`\n=== ${q.name} ===`);
  try {
    const rows = db.prepare(q.sql).all();
    if (rows.length === 0) {
      console.log('(No data)');
    } else {
      console.table(rows);
    }
  } catch (err) {
    console.error('Error running query:', err.message);
  }
}

db.close();
