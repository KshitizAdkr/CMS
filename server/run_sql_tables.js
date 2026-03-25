 const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'medicare.db');
const db = new Database(dbPath);

const queries = [
  { name: 'Q1: View all MediCare Clinic doctors', sql: 'SELECT * FROM Doctors' },
  { name: 'Q2: View all MediCare Clinic patients', sql: 'SELECT * FROM Patients' },
  { name: 'Q3: View all MediCare Clinic appointments', sql: 'SELECT * FROM Appointments' },
  { name: 'Q4: View all MediCare Clinic prescriptions', sql: 'SELECT * FROM Prescriptions' },
  { name: 'Q5: Patients from Kathmandu', sql: "SELECT * FROM Patients WHERE City = 'Kathmandu'" },
  { name: 'Q13: Total number of doctors', sql: 'SELECT COUNT(*) AS TotalDoctors FROM Doctors' },
  { name: 'Q19: Number of appointments per status', sql: 'SELECT Status, COUNT(*) AS Total FROM Appointments GROUP BY Status' },
  { name: 'Q23: Full appointment details (INNER JOIN)', sql: 'SELECT a.AppointmentId, p.Name AS PatientName, d.Name AS DoctorName, d.Specialization, a.AppDate, a.AppTime, a.Status, a.Reason FROM Appointments a INNER JOIN Patients p ON a.PatientId = p.PatientId INNER JOIN Doctors d ON a.DoctorId = d.DoctorId LIMIT 5' },
  { name: 'Q28: Doctor workload (LEFT JOIN)', sql: 'SELECT d.Name AS DoctorName, d.Specialization, COUNT(a.AppointmentId) AS TotalAppointments FROM Doctors d LEFT JOIN Appointments a ON d.DoctorId = a.DoctorId GROUP BY d.DoctorId, d.Name, d.Specialization ORDER BY TotalAppointments DESC' },
];

for (const q of queries) {
  console.log(`\n================================================================`);
  console.log(`=== ${q.name} ===`);
  console.log(`================================================================`);
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
