const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

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

let mdContent = '# 📊 MediCare SQL Queries - Tabulated Output\n\n';

for (const q of queries) {
  mdContent += `### ${q.name}\n\n\`\`\`sql\n${q.sql}\n\`\`\`\n\n`;
  try {
    const rows = db.prepare(q.sql).all();
    if (rows.length === 0) {
      mdContent += '*(No data)*\n\n';
    } else {
      const keys = Object.keys(rows[0]);
      mdContent += '| ' + keys.join(' | ') + ' |\n';
      mdContent += '| ' + keys.map(() => '---').join(' | ') + ' |\n';
      
      for (const row of rows) {
        mdContent += '| ' + keys.map(k => {
          let val = row[k];
          if (val === null) return 'NULL';
          return String(val).replace(/\|/g, '\\|');
        }).join(' | ') + ' |\n';
      }
      mdContent += '\n';
    }
  } catch (err) {
    mdContent += `**Error running query:** ${err.message}\n\n`;
  }
}

// Write to the agent's brain dir so it's accessible as an artifact
const outPath = 'C:/Users/kshit/.gemini/antigravity/brain/94fc028d-4dd2-4dee-990c-7cee918526e1/sql_tabulated.md';
fs.writeFileSync(outPath, mdContent);
console.log(`Report generated at: ${outPath}`);

db.close();
