const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_PATH = path.join(__dirname, 'medicare.db');

// Delete existing db file for fresh start
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('🗑️  Removed old database file.');
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
console.log('🔌 SQLite database created at:', DB_PATH);

// CREATE TABLES (DDL)
db.exec(`
  -- Table 0: Departments (Added for internal structure)
  CREATE TABLE Departments (
      DeptId INTEGER PRIMARY KEY AUTOINCREMENT,
      Name   TEXT NOT NULL UNIQUE
  );

  -- Table 1: Doctors
  CREATE TABLE Doctors (
      DoctorId        INTEGER PRIMARY KEY AUTOINCREMENT,
      Name            TEXT NOT NULL,
      Specialization  TEXT,
      Phone           TEXT,
      Email           TEXT UNIQUE,
      Salary          REAL,
      City            TEXT,
      DeptId          INTEGER,
      Password        TEXT, -- Internal field
      FOREIGN KEY (DeptId) REFERENCES Departments(DeptId)
  );

  -- Table 2: Patients
  CREATE TABLE Patients (
      PatientId   INTEGER PRIMARY KEY AUTOINCREMENT,
      Name        TEXT NOT NULL,
      Age         INTEGER,
      Gender      TEXT,
      Phone       TEXT,
      City        TEXT,
      BloodGroup  TEXT,
      Email       TEXT UNIQUE, -- Internal field
      Password    TEXT,        -- Internal field
      Status      TEXT DEFAULT 'active' CHECK (Status IN ('active', 'inactive'))
  );

  -- Table 3: Appointments
  CREATE TABLE Appointments (
      AppointmentId   INTEGER PRIMARY KEY AUTOINCREMENT,
      PatientId       INTEGER NOT NULL,
      DoctorId        INTEGER NOT NULL,
      AppDate         TEXT NOT NULL,
      AppTime         TEXT,
      Status          TEXT DEFAULT 'Scheduled' CHECK (Status IN ('Scheduled', 'Completed', 'Cancelled')),
      Reason          TEXT,
      FOREIGN KEY (PatientId) REFERENCES Patients(PatientId) ON DELETE CASCADE,
      FOREIGN KEY (DoctorId)  REFERENCES Doctors(DoctorId)   ON DELETE CASCADE
  );

  -- Optimization: Indexes
  CREATE INDEX idx_appointments_date ON Appointments(AppDate);
  CREATE INDEX idx_appointments_status ON Appointments(Status);
  CREATE INDEX idx_doctors_dept ON Doctors(DeptId);

  -- Table 4: Prescriptions
  CREATE TABLE Prescriptions (
      PrescriptionId  INTEGER PRIMARY KEY AUTOINCREMENT,
      AppointmentId   INTEGER NOT NULL,
      Medicine        TEXT,
      Dosage          TEXT,
      Duration        TEXT,
      Notes           TEXT,
      FOREIGN KEY (AppointmentId) REFERENCES Appointments(AppointmentId) ON DELETE CASCADE
  );

  -- Table 5: Bills (Requested in Step Id 427)
  CREATE TABLE Bills (
      BillId      INTEGER PRIMARY KEY AUTOINCREMENT,
      PatientId   INTEGER NOT NULL,
      ApptId      INTEGER,
      Amount      REAL,
      Status      TEXT DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Paid', 'Cancelled')),
      IssuedAt    TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (PatientId) REFERENCES Patients(PatientId) ON DELETE CASCADE,
      FOREIGN KEY (ApptId)    REFERENCES Appointments(AppointmentId) ON DELETE SET NULL
  );

  -- Table 6: Audit (Lab 6)
  CREATE TABLE MediCare_AppointmentAudit (
      AuditId     INTEGER PRIMARY KEY AUTOINCREMENT,
      AuditMsg    TEXT,
      AuditTime   TEXT DEFAULT (datetime('now'))
  );

  -- Internal Table: Admins
  CREATE TABLE Admins (
      AdminId     INTEGER PRIMARY KEY AUTOINCREMENT,
      Name        TEXT NOT NULL,
      Email       TEXT NOT NULL UNIQUE,
      Password    TEXT NOT NULL
  );
`);
console.log('🗂️  Tables created (DDL).');

// VIEWS 
db.exec(`
  -- View 1: Full appointment details
  CREATE VIEW vw_MediCare_AppointmentDetails AS
  SELECT
      a.AppointmentId,
      p.Name          AS PatientName,
      p.Age,
      p.BloodGroup,
      d.Name          AS DoctorName,
      d.Specialization,
      a.AppDate,
      a.AppTime,
      a.Status,
      a.Reason
  FROM Appointments a
  JOIN Patients p ON a.PatientId = p.PatientId
  JOIN Doctors  d ON a.DoctorId  = d.DoctorId;

  -- View 2: Scheduled appointments
  CREATE VIEW vw_MediCare_ScheduledAppointments AS
  SELECT * FROM vw_MediCare_AppointmentDetails
  WHERE Status = 'Scheduled';

  -- View 3: Doctor workload
  CREATE VIEW vw_MediCare_DoctorWorkload AS
  SELECT
      d.Name              AS DoctorName,
      d.Specialization,
      COUNT(a.AppointmentId) AS TotalAppointments
  FROM Doctors d
  LEFT JOIN Appointments a ON d.DoctorId = a.DoctorId
  GROUP BY d.DoctorId, d.Name, d.Specialization;
`);
console.log('👁️  Views created.');

// TRIGGERS 
db.exec(`
  -- Trigger 1: Log new appointments
  CREATE TRIGGER tr_MediCare_AfterAppointmentInsert
  AFTER INSERT ON Appointments
  FOR EACH ROW
  BEGIN
      INSERT INTO MediCare_AppointmentAudit (AuditMsg, AuditTime)
      VALUES (
          '[MediCare Clinic] New Appointment #' || NEW.AppointmentId ||
          ' | PatientId=' || NEW.PatientId ||
          ' | DoctorId=' || NEW.DoctorId ||
          ' | Date=' || NEW.AppDate,
          datetime('now')
      );
  END;

  -- Trigger 2: Log cancelled appointments
  CREATE TRIGGER tr_MediCare_AfterAppointmentUpdate
  AFTER UPDATE OF Status ON Appointments
  FOR EACH ROW
  WHEN NEW.Status = 'Cancelled'
  BEGIN
      INSERT INTO MediCare_AppointmentAudit (AuditMsg, AuditTime)
      VALUES (
          '[MediCare Clinic] Appointment #' || NEW.AppointmentId ||
          ' CANCELLED | PatientId=' || NEW.PatientId,
          datetime('now')
      );
  END;
`);
console.log('⚡ Triggers created.');

// INSERT SAMPLE DATA (DML)
const commonPass = bcrypt.hashSync('doc123', 10);
const adminPass  = bcrypt.hashSync('admin123', 10);
const patientPass = bcrypt.hashSync('patient123', 10);

// Seed Departments
const insertDept = db.prepare('INSERT INTO Departments (Name) VALUES (?)');
['Cardiology','Dermatology','Neurology','Pediatrics','Orthopedics','General Medicine'].forEach(d => insertDept.run(d));

// Seed Doctors
const insertDoc = db.prepare('INSERT INTO Doctors (Name, Specialization, Phone, Email, Salary, City, DeptId, Password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
[
  ['Dr. Ramesh Sharma',  'Cardiologist',   '9800011111', 'ramesh@medicareclinic.com',  85000, 'Kathmandu', 1],
  ['Dr. Sita Thapa',     'Dermatologist',  '9800022222', 'sita@medicareclinic.com',    75000, 'Pokhara',   2],
  ['Dr. Hari Bahadur',   'Neurologist',    '9800033333', 'hari@medicareclinic.com',    90000, 'Kathmandu', 3],
  ['Dr. Gita Rai',       'Pediatrician',   '9800044444', 'gita@medicareclinic.com',    70000, 'Lalitpur',  4],
  ['Dr. Bikash KC',      'Orthopedic',     '9800055555', 'bikash@medicareclinic.com',  80000, 'Bhaktapur', 5],
].forEach(d => insertDoc.run(...d, commonPass));

// Seed Patients
const insertPat = db.prepare('INSERT INTO Patients (Name, Age, Gender, Phone, City, BloodGroup, Email, Password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
[
  ['Ram Prasad',      35, 'Male',   '9811111111', 'Kathmandu', 'A+',  'ram@patient.com'],
  ['Sunita Karki',    28, 'Female', '9811222222', 'Pokhara',   'B+',  'sunita@patient.com'],
  ['Mohan Tamang',    45, 'Male',   '9811333333', 'Lalitpur',  'O+',  'mohan@patient.com'],
  ['Anita Shrestha',  32, 'Female', '9811444444', 'Kathmandu', 'AB+', 'anita@patient.com'],
  ['Rajan Adhikari',  52, 'Male',   '9811555555', 'Bhaktapur', 'A-',  'rajan@patient.com'],
  ['Puja Gurung',     22, 'Female', '9811666666', 'Kathmandu', 'B-',  'puja@patient.com'],
  ['Suresh Magar',    60, 'Male',   '9811777777', 'Pokhara',   'O-',  'suresh@patient.com'],
].forEach(p => insertPat.run(...p, patientPass));

// Seed Appointments
const insertAppt = db.prepare('INSERT INTO Appointments (PatientId, DoctorId, AppDate, AppTime, Status, Reason) VALUES (?, ?, ?, ?, ?, ?)');
[
  [1, 1, '2025-01-05', '10:00:00', 'Completed',  'Chest pain'],
  [2, 2, '2025-01-08', '11:00:00', 'Completed',  'Skin rash'],
  [3, 3, '2025-01-10', '09:30:00', 'Completed',  'Headache'],
  [4, 4, '2025-01-12', '14:00:00', 'Completed',  'Child fever'],
  [5, 5, '2025-01-15', '10:30:00', 'Completed',  'Knee pain'],
  [6, 1, '2025-02-01', '09:00:00', 'Scheduled',  'Breathing issue'],
  [7, 3, '2025-02-05', '11:30:00', 'Scheduled',  'Dizziness'],
  [1, 2, '2025-02-10', '10:00:00', 'Cancelled',  'Skin allergy'],
  [3, 1, '2025-02-15', '13:00:00', 'Scheduled',  'Follow-up checkup'],
  [2, 4, '2025-02-20', '15:00:00', 'Scheduled',  'Routine checkup'],
].forEach(a => insertAppt.run(...a));

// Seed Prescriptions
const insertPr = db.prepare('INSERT INTO Prescriptions (AppointmentId, Medicine, Dosage, Duration, Notes) VALUES (?, ?, ?, ?, ?)');
[
  [1, 'Aspirin',       '75mg',  '30 days', 'Take after meals'],
  [1, 'Atorvastatin',  '10mg',  '60 days', 'Take at night'],
  [2, 'Cetirizine',    '10mg',  '7 days',  'Take once daily'],
  [3, 'Paracetamol',   '500mg', '5 days',  'Take when needed'],
  [3, 'Ibuprofen',     '400mg', '3 days',  'Take after food'],
  [4, 'Amoxicillin',   '250mg', '7 days',  'Three times a day'],
  [5, 'Diclofenac',    '50mg',  '10 days', 'Apply gel on knee'],
].forEach(p => insertPr.run(...p));

// Seed Bills
const insertBill = db.prepare('INSERT INTO Bills (PatientId, ApptId, Amount, Status) VALUES (?, ?, ?, ?)');
[
  [1, 1, 2500, 'Paid'],
  [2, 2, 1800, 'Paid'],
  [3, 3, 3200, 'Pending'],
  [4, 4, 1500, 'Paid'],
  [5, 5, 2200, 'Pending'],
].forEach(b => insertBill.run(...b));

// Seed Admin
db.prepare('INSERT INTO Admins (Name, Email, Password) VALUES (?, ?, ?)').run('System Admin', 'admin@medicare.com', adminPass);

console.log('🌱 Seed data inserted (DML).');

console.log('\n══════════════════════════════════════════');
console.log('   Database setup complete (SQLite)!');
console.log('   Admin:   admin@medicare.com / admin123');
console.log('   Doctor:  ramesh@medicareclinic.com / doc123');
console.log('   Patient: ram@patient.com / patient123');
console.log('══════════════════════════════════════════\n');

db.close();
process.exit(0);
