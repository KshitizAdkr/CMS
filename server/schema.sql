
CREATE DATABASE IF NOT EXISTS MediCareClinicDB;
USE MediCareClinicDB;

CREATE TABLE Departments (
    DeptId          INT PRIMARY KEY AUTO_INCREMENT,
    Name            VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Doctors (
    DoctorId        INT PRIMARY KEY AUTO_INCREMENT,
    Name            VARCHAR(100) NOT NULL,
    Specialization  VARCHAR(100),
    Phone           VARCHAR(15),
    Email           VARCHAR(100) UNIQUE,
    Salary          DECIMAL(10,2),
    City            VARCHAR(50),
    DeptId          INT,
    Password        VARCHAR(255),
    FOREIGN KEY (DeptId) REFERENCES Departments(DeptId)
);

CREATE TABLE Patients (
    PatientId   INT PRIMARY KEY AUTO_INCREMENT,
    Name        VARCHAR(100) NOT NULL,
    Age         INT,
    Gender      VARCHAR(10),
    Phone       VARCHAR(15),
    City        VARCHAR(50),
    BloodGroup  VARCHAR(5),
    Email       VARCHAR(100) UNIQUE,
    Password    VARCHAR(255),
    Status      VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'inactive'))
);

CREATE TABLE Appointments (
    AppointmentId   INT PRIMARY KEY AUTO_INCREMENT,
    PatientId       INT NOT NULL,
    DoctorId        INT NOT NULL,
    AppDate         DATE NOT NULL,
    AppTime         TIME,
    Status          VARCHAR(20) DEFAULT 'Scheduled' CHECK (Status IN ('Scheduled', 'Completed', 'Cancelled')),
    Reason          VARCHAR(200),
    FOREIGN KEY (PatientId) REFERENCES Patients(PatientId) ON DELETE CASCADE,
    FOREIGN KEY (DoctorId)  REFERENCES Doctors(DoctorId)   ON DELETE CASCADE
);

-- Indexes for appointments
CREATE INDEX idx_appointments_date ON Appointments(AppDate);
CREATE INDEX idx_appointments_status ON Appointments(Status);
CREATE INDEX idx_doctors_dept ON Doctors(DeptId);

CREATE TABLE Prescriptions (
    PrescriptionId  INT PRIMARY KEY AUTO_INCREMENT,
    AppointmentId   INT NOT NULL,
    Medicine        VARCHAR(100),
    Dosage          VARCHAR(50),
    Duration        VARCHAR(50),
    Notes           VARCHAR(200),
    FOREIGN KEY (AppointmentId) REFERENCES Appointments(AppointmentId) ON DELETE CASCADE
);
 
CREATE TABLE Bills (
    BillId      INT PRIMARY KEY AUTO_INCREMENT,
    PatientId   INT NOT NULL,
    ApptId      INT,
    Amount      DECIMAL(10,2),
    Status      VARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Paid', 'Cancelled')),
    IssuedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PatientId) REFERENCES Patients(PatientId) ON DELETE CASCADE,
    FOREIGN KEY (ApptId)    REFERENCES Appointments(AppointmentId) ON DELETE SET NULL
);

-- Audit Log Table
CREATE TABLE MediCare_AppointmentAudit (
    AuditId     INT PRIMARY KEY AUTO_INCREMENT,
    AuditMsg    VARCHAR(300),
    AuditTime   DATETIME
);

-- Admins (Internal) Table 
CREATE TABLE Admins (
    AdminId     INT PRIMARY KEY AUTO_INCREMENT,
    Name        VARCHAR(100) NOT NULL,
    Email       VARCHAR(100) NOT NULL UNIQUE,
    Password    VARCHAR(255) NOT NULL
);

-- Departments
INSERT INTO Departments (Name) VALUES
('Cardiology'), ('Dermatology'), ('Neurology'),
('Pediatrics'), ('Orthopedics'), ('General Medicine');

-- Doctors
INSERT INTO Doctors (Name, Specialization, Phone, Email, Salary, City, DeptId) VALUES
('Dr. Ramesh Sharma',  'Cardiologist',   '9800011111', 'ramesh@medicareclinic.com',  85000.00, 'Kathmandu', 1),
('Dr. Sita Thapa',     'Dermatologist',  '9800022222', 'sita@medicareclinic.com',    75000.00, 'Pokhara',   2),
('Dr. Hari Bahadur',   'Neurologist',    '9800033333', 'hari@medicareclinic.com',    90000.00, 'Kathmandu', 3),
('Dr. Gita Rai',       'Pediatrician',   '9800044444', 'gita@medicareclinic.com',    70000.00, 'Lalitpur',  4),
('Dr. Bikash KC',      'Orthopedic',     '9800055555', 'bikash@medicareclinic.com',  80000.00, 'Bhaktapur', 5);

-- Patients
INSERT INTO Patients (Name, Age, Gender, Phone, City, BloodGroup) VALUES
('Ram Prasad',      35, 'Male',   '9811111111', 'Kathmandu', 'A+'),
('Sunita Karki',    28, 'Female', '9811222222', 'Pokhara',   'B+'),
('Mohan Tamang',    45, 'Male',   '9811333333', 'Lalitpur',  'O+'),
('Anita Shrestha',  32, 'Female', '9811444444', 'Kathmandu', 'AB+'),
('Rajan Adhikari',  52, 'Male',   '9811555555', 'Bhaktapur', 'A-'),
('Puja Gurung',     22, 'Female', '9811666666', 'Kathmandu', 'B-'),
('Suresh Magar',    60, 'Male',   '9811777777', 'Pokhara',   'O-');

-- Appointments
INSERT INTO Appointments (PatientId, DoctorId, AppDate, AppTime, Status, Reason) VALUES
(1, 1, '2025-01-05', '10:00:00', 'Completed',  'Chest pain'),
(2, 2, '2025-01-08', '11:00:00', 'Completed',  'Skin rash'),
(3, 3, '2025-01-10', '09:30:00', 'Completed',  'Headache'),
(4, 4, '2025-01-12', '14:00:00', 'Completed',  'Child fever'),
(5, 5, '2025-01-15', '10:30:00', 'Completed',  'Knee pain'),
(6, 1, '2025-02-01', '09:00:00', 'Scheduled',  'Breathing issue'),
(7, 3, '2025-02-05', '11:30:00', 'Scheduled',  'Dizziness'),
(1, 2, '2025-02-10', '10:00:00', 'Cancelled',  'Skin allergy'),
(3, 1, '2025-02-15', '13:00:00', 'Scheduled',  'Follow-up checkup'),
(2, 4, '2025-02-20', '15:00:00', 'Scheduled',  'Routine checkup');

-- Prescriptions
INSERT INTO Prescriptions (AppointmentId, Medicine, Dosage, Duration, Notes) VALUES
(1, 'Aspirin',       '75mg',  '30 days', 'Take after meals'),
(1, 'Atorvastatin',  '10mg',  '60 days', 'Take at night'),
(2, 'Cetirizine',    '10mg',  '7 days',  'Take once daily'),
(3, 'Paracetamol',   '500mg', '5 days',  'Take when needed'),
(3, 'Ibuprofen',     '400mg', '3 days',  'Take after food'),
(4, 'Amoxicillin',   '250mg', '7 days',  'Three times a day'),
(5, 'Diclofenac',    '50mg',  '10 days', 'Apply gel on knee');

-- Bills
INSERT INTO Bills (PatientId, ApptId, Amount, Status) VALUES
(1, 1, 2500.00, 'Paid'),
(2, 2, 1800.00, 'Paid'),
(3, 3, 3200.00, 'Pending'),
(4, 4, 1500.00, 'Paid'),
(5, 5, 2200.00, 'Pending');

-- View all MediCare Clinic doctors
SELECT * FROM Doctors;

-- View all MediCare Clinic patients
SELECT * FROM Patients;

-- View all MediCare Clinic appointments
SELECT * FROM Appointments;

-- View all MediCare Clinic prescriptions
SELECT * FROM Prescriptions;

-- Patients from Kathmandu
SELECT * FROM Patients WHERE City = 'Kathmandu';

-- Scheduled appointments only
SELECT * FROM Appointments WHERE Status = 'Scheduled';

-- MediCare doctors with salary greater than 75000
SELECT Name, Specialization, Salary FROM Doctors WHERE Salary > 75000;

-- Male patients above age 40
SELECT * FROM Patients WHERE Gender = 'Male' AND Age > 40;

-- Appointments in February 2025
SELECT * FROM Appointments
WHERE AppDate BETWEEN '2025-02-01' AND '2025-02-28';

-- Doctors ordered by salary descending
SELECT Name, Specialization, Salary FROM Doctors ORDER BY Salary DESC;

-- Patients with Blood Group A+ or O+
SELECT * FROM Patients WHERE BloodGroup IN ('A+', 'O+');

-- Doctor names starting with 'Dr. S'
SELECT * FROM Doctors WHERE Name LIKE 'Dr. S%';

-- Total number of doctors
SELECT COUNT(*) AS TotalDoctors FROM Doctors;

-- Total number of patients
SELECT COUNT(*) AS TotalPatients FROM Patients;

--  Average age of patients
SELECT AVG(Age) AS AvgPatientAge FROM Patients;

-- Highest paid doctor
SELECT Name, MAX(Salary) AS HighestSalary FROM Doctors;

-- Lowest paid doctor
SELECT Name, MIN(Salary) AS LowestSalary FROM Doctors;

-- Total salary paid
SELECT SUM(Salary) AS TotalSalaryPaid FROM Doctors;

-- Number of appointments per status
SELECT Status, COUNT(*) AS Total
FROM Appointments
GROUP BY Status;

-- Number of appointments per doctor
SELECT DoctorId, COUNT(*) AS TotalAppointments
FROM Appointments
GROUP BY DoctorId;

-- Doctors with more than 1 appointment
SELECT DoctorId, COUNT(*) AS TotalAppointments
FROM Appointments
GROUP BY DoctorId
HAVING COUNT(*) > 1;

-- Average doctor salary by city
SELECT City, AVG(Salary) AS AvgSalary
FROM Doctors
GROUP BY City;

-- JOINS

-- Full appointment details at MediCare Clinic (INNER JOIN)
SELECT
    a.AppointmentId,
    p.Name          AS PatientName,
    d.Name          AS DoctorName,
    d.Specialization,
    a.AppDate,
    a.AppTime,
    a.Status,
    a.Reason
FROM Appointments a
INNER JOIN Patients p ON a.PatientId = p.PatientId
INNER JOIN Doctors  d ON a.DoctorId  = d.DoctorId;

-- All patients including those with no appointments (LEFT JOIN)
SELECT
    p.Name      AS PatientName,
    p.City,
    a.AppDate,
    a.Status
FROM Patients p
LEFT JOIN Appointments a ON p.PatientId = a.PatientId;

-- All MediCare doctors including those with no appointments (LEFT JOIN)
SELECT
    d.Name          AS DoctorName,
    d.Specialization,
    a.AppDate,
    a.Status
FROM Doctors d
LEFT JOIN Appointments a ON d.DoctorId = a.DoctorId;

-- Prescription details with Patient and Doctor name
SELECT
    p.Name      AS PatientName,
    d.Name      AS DoctorName,
    pr.Medicine,
    pr.Dosage,
    pr.Duration,
    pr.Notes
FROM Prescriptions pr
INNER JOIN Appointments a ON pr.AppointmentId = a.AppointmentId
INNER JOIN Patients     p ON a.PatientId      = p.PatientId
INNER JOIN Doctors      d ON a.DoctorId       = d.DoctorId;

-- Patients who visited MediCare Cardiologist
SELECT DISTINCT p.Name, p.Age, p.BloodGroup
FROM Patients p
INNER JOIN Appointments a ON p.PatientId = a.PatientId
INNER JOIN Doctors      d ON a.DoctorId  = d.DoctorId
WHERE d.Specialization = 'Cardiologist';

-- MediCare doctor workload with total appointments
SELECT
    d.Name              AS DoctorName,
    d.Specialization,
    COUNT(a.AppointmentId) AS TotalAppointments
FROM Doctors d
LEFT JOIN Appointments a ON d.DoctorId = a.DoctorId
GROUP BY d.DoctorId, d.Name, d.Specialization
ORDER BY TotalAppointments DESC;

-- SUBQUERIES

-- Patients who have at least one appointment
SELECT Name FROM Patients
WHERE PatientId IN (
    SELECT DISTINCT PatientId FROM Appointments
);

-- Patients who have NO appointments yet
SELECT Name FROM Patients
WHERE PatientId NOT IN (
    SELECT DISTINCT PatientId FROM Appointments
);

-- MediCare doctor with the highest salary
SELECT Name, Specialization, Salary FROM Doctors
WHERE Salary = (
    SELECT MAX(Salary) FROM Doctors
);

--  Patients younger than average patient age
SELECT Name, Age FROM Patients
WHERE Age < (
    SELECT AVG(Age) FROM Patients
);

--  Doctors who have at least one Completed appointment
SELECT Name, Specialization FROM Doctors
WHERE DoctorId IN (
    SELECT DISTINCT DoctorId FROM Appointments
    WHERE Status = 'Completed'
);

-- VIEWS

-- Full appointment details 
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

SELECT * FROM vw_MediCare_AppointmentDetails;

-- Scheduled appointments
CREATE VIEW vw_MediCare_ScheduledAppointments AS
SELECT * FROM vw_MediCare_AppointmentDetails
WHERE Status = 'Scheduled';

SELECT * FROM vw_MediCare_ScheduledAppointments;

-- MediCare doctor workload
CREATE VIEW vw_MediCare_DoctorWorkload AS
SELECT
    d.Name              AS DoctorName,
    d.Specialization,
    COUNT(a.AppointmentId) AS TotalAppointments
FROM Doctors d
LEFT JOIN Appointments a ON d.DoctorId = a.DoctorId
GROUP BY d.DoctorId, d.Name, d.Specialization;

SELECT * FROM vw_MediCare_DoctorWorkload ORDER BY TotalAppointments DESC;

-- STORED PROCEDURES

DELIMITER $$

-- Get all appointments of a patient
CREATE PROCEDURE spMediCare_GetPatientAppointments(IN pPatientId INT)
BEGIN
    SELECT
        a.AppointmentId,
        d.Name          AS DoctorName,
        d.Specialization,
        a.AppDate,
        a.AppTime,
        a.Status,
        a.Reason
    FROM Appointments a
    JOIN Doctors d ON a.DoctorId = d.DoctorId
    WHERE a.PatientId = pPatientId;
END$$

-- Get all appointments assigned to a doctor
CREATE PROCEDURE spMediCare_GetDoctorAppointments(IN pDoctorId INT)
BEGIN
    SELECT
        a.AppointmentId,
        p.Name  AS PatientName,
        p.Age,
        p.BloodGroup,
        a.AppDate,
        a.AppTime,
        a.Status,
        a.Reason
    FROM Appointments a
    JOIN Patients p ON a.PatientId = p.PatientId
    WHERE a.DoctorId = pDoctorId;
END$$

DELIMITER ;

-- Execute Procedures
CALL spMediCare_GetPatientAppointments(1);
CALL spMediCare_GetPatientAppointments(2);
CALL spMediCare_GetDoctorAppointments(1);

-- TRIGGERS

DELIMITER $$

-- Log every new appointment booked
CREATE TRIGGER tr_MediCare_AfterAppointmentInsert
AFTER INSERT ON Appointments
FOR EACH ROW
BEGIN
    INSERT INTO MediCare_AppointmentAudit (AuditMsg, AuditTime)
    VALUES (
        CONCAT(
            '[MediCare Clinic] New Appointment #', NEW.AppointmentId,
            ' | PatientId=', NEW.PatientId,
            ' | DoctorId=',  NEW.DoctorId,
            ' | Date=',      NEW.AppDate
        ),
        NOW()
    );
END$$

-- Log every cancelled appointment
CREATE TRIGGER tr_MediCare_AfterAppointmentUpdate
AFTER UPDATE ON Appointments
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Cancelled' THEN
        INSERT INTO MediCare_AppointmentAudit (AuditMsg, AuditTime)
        VALUES (
            CONCAT(
                '[MediCare Clinic] Appointment #', NEW.AppointmentId,
                ' CANCELLED | PatientId=', NEW.PatientId
            ),
            NOW()
        );
    END IF;
END$$

DELIMITER ;

-- Add a new appointment
INSERT INTO Appointments (PatientId, DoctorId, AppDate, AppTime, Status, Reason)
VALUES (4, 2, '2025-03-01', '10:00:00', 'Scheduled', 'Skin checkup');

-- Cancel an appointment
UPDATE Appointments SET Status = 'Cancelled' WHERE AppointmentId = 9;

-- Check MediCare audit log
SELECT * FROM MediCare_AppointmentAudit;

-- DCL - USER PERMISSIONS

-- Receptionist: view and book appointments only
CREATE USER 'medicare_receptionist'@'localhost' IDENTIFIED BY 'recep123';
GRANT SELECT, INSERT ON MediCareClinicDB.Appointments TO 'medicare_receptionist'@'localhost';
GRANT SELECT ON MediCareClinicDB.Doctors   TO 'medicare_receptionist'@'localhost';
GRANT SELECT ON MediCareClinicDB.Patients  TO 'medicare_receptionist'@'localhost';

-- Doctor: view patients, update appointments, add prescriptions
CREATE USER 'medicare_doctor'@'localhost' IDENTIFIED BY 'doc123';
GRANT SELECT ON MediCareClinicDB.Patients          TO 'medicare_doctor'@'localhost';
GRANT SELECT, UPDATE ON MediCareClinicDB.Appointments   TO 'medicare_doctor'@'localhost';
GRANT SELECT, INSERT ON MediCareClinicDB.Prescriptions  TO 'medicare_doctor'@'localhost';

-- Admin: full access
CREATE USER 'medicare_admin'@'localhost' IDENTIFIED BY 'admin123';
GRANT ALL PRIVILEGES ON MediCareClinicDB.* TO 'medicare_admin'@'localhost';

FLUSH PRIVILEGES;

-- TCL TRANSACTIONS

-- Book a new appointment at MediCare Clinic safely
START TRANSACTION;

INSERT INTO Appointments (PatientId, DoctorId, AppDate, AppTime, Status, Reason)
VALUES (6, 5, '2025-03-10', '11:00:00', 'Scheduled', 'Back pain');

SELECT * FROM Appointments WHERE PatientId = 6;

COMMIT;

-- Cancel an appointment
START TRANSACTION;

UPDATE Appointments
SET Status = 'Cancelled'
WHERE AppointmentId = 10;

SELECT * FROM Appointments WHERE AppointmentId = 10;

COMMIT;

-- UPDATE & DELETE (DML)

-- Update patient phone number
UPDATE Patients SET Phone = '9899999999' WHERE PatientId = 1;

-- Mark an appointment as Completed
UPDATE Appointments SET Status = 'Completed' WHERE AppointmentId = 6;

-- Add a new doctor to MediCare Clinic
INSERT INTO Doctors (Name, Specialization, Phone, Email, Salary, City)
VALUES ('Dr. Anup Joshi', 'General Physician', '9800066666', 'anup@medicareclinic.com', 65000.00, 'Kathmandu');

-- final verif

SELECT 'MediCare Clinic - Doctors'       AS TableName; SELECT * FROM Doctors;
SELECT 'MediCare Clinic - Patients'      AS TableName; SELECT * FROM Patients;
SELECT 'MediCare Clinic - Appointments'  AS TableName; SELECT * FROM Appointments;
SELECT 'MediCare Clinic - Prescriptions' AS TableName; SELECT * FROM Prescriptions;
SELECT 'MediCare Clinic - Bills'         AS TableName; SELECT * FROM Bills;
SELECT 'MediCare Clinic - Audit Log'     AS TableName; SELECT * FROM MediCare_AppointmentAudit;