// SQL uses PascalCase columns (DoctorId, PatientName, etc.) for academic requirements.
// This wrapper normalizes keys to snake case for the frontend.

const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const DB_PATH = path.join(__dirname, '..', 'medicare.db');
const sqlite = new Database(DB_PATH);

// Enable WAL mode for better concurrency
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Convert PascalCase keys to snake_case / frontend-friendly keys
function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  const map = {
    // Primary keys
    DoctorId: 'id', PatientId: 'id', AppointmentId: 'id',
    PrescriptionId: 'id', BillId: 'id', AdminId: 'id',
    DeptId: 'department_id', AuditId: 'id',
    // Common fields
    Name: 'name', Email: 'email', Password: 'password',
    Phone: 'phone', City: 'city', Salary: 'salary',
    Specialization: 'specialization', Status: 'status',
    Gender: 'gender', Age: 'age', BloodGroup: 'blood_group',
    // Appointment fields
    AppDate: 'date', AppTime: 'time', Reason: 'reason',
    // Prescription fields
    Medicine: 'medicine', Dosage: 'dosage', Duration: 'duration',
    Notes: 'notes',
    // Bill fields
    Amount: 'amount', ApptId: 'appointment_id', IssuedAt: 'date',
    // Audit
    AuditMsg: 'audit_msg', AuditTime: 'audit_time',
    // Department
    DepartmentName: 'department_name',
    // JOIN aliases (these are already good)
    PatientName: 'patient_name', DoctorName: 'doctor_name',
    PatientPhone: 'patient_phone', DoctorPhone: 'doctor_phone',
    AppointmentDate: 'appointment_date',
  };

  const out = {};
  for (const [key, val] of Object.entries(row)) {
    out[map[key] || key] = val;
  }

  // Ensure FK references still work — keep original FK IDs too
  if (row.PatientId !== undefined && row.AppointmentId !== undefined) {
    // This is an appointment row — id = AppointmentId, patient_id / doctor_id stay
    out.id = row.AppointmentId;
    out.patient_id = row.PatientId;
    out.doctor_id = row.DoctorId;
  } else if (row.PrescriptionId !== undefined) {
    out.id = row.PrescriptionId;
    out.appointment_id = row.AppointmentId;
    if (row.PatientId) out.patient_id = row.PatientId;
    if (row.DoctorId) out.doctor_id = row.DoctorId;
  } else if (row.BillId !== undefined) {
    out.id = row.BillId;
    out.patient_id = row.PatientId;
    out.appointment_id = row.ApptId;
  } else if (row.DoctorId !== undefined && row.PatientId === undefined) {
    out.id = row.DoctorId;
    out.department_id = row.DeptId;
  } else if (row.PatientId !== undefined && row.DoctorId === undefined) {
    out.id = row.PatientId;
  } else if (row.AdminId !== undefined) {
    out.id = row.AdminId;
  }

  return out;
}

// mysql2-compatible wrapper: db.query(sql, params) → [rows, fields]
const db = {
  async query(sql, params = []) {
    try {
      const trimmed = sql.trim();
      const isSelect = /^SELECT/i.test(trimmed);
      const isInsert = /^INSERT/i.test(trimmed);
      const isUpdate = /^UPDATE/i.test(trimmed);
      const isDelete = /^DELETE/i.test(trimmed);

      if (isSelect) {
        const rows = sqlite.prepare(trimmed).all(...params);
        return [rows.map(normalizeRow), []];
      } else if (isInsert) {
        const info = sqlite.prepare(trimmed).run(...params);
        return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }, []];
      } else if (isUpdate || isDelete) {
        const info = sqlite.prepare(trimmed).run(...params);
        return [{ affectedRows: info.changes }, []];
      } else {
        // DDL or other statements
        sqlite.exec(trimmed);
        return [{ affectedRows: 0 }, []];
      }
    } catch (err) {
      // Map SQLite error codes to MySQL-style codes for compatibility
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        err.code = 'ER_DUP_ENTRY';
      }
      throw err;
    }
  },
};

module.exports = db;
