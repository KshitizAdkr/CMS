
USE medicare_clinic;

-- Departments
INSERT INTO departments (name) VALUES
  ('Cardiology'),
  ('Dermatology'),
  ('Neurology'),
  ('Pediatrics'),
  ('Orthopedics'),
  ('General Medicine');

--  Admin Password: admin123 //suru ko lagi, paxi signup required
INSERT INTO admins (name, email, password) VALUES
  ('Admin User', 'admin@medicare.com', '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5');

-- Doctors Password for all: doc123 //suru ko lagi, paxi signup required
INSERT INTO doctors (name, email, password, phone, specialization, salary, city, department_id, status) VALUES
  ('Dr. Ramesh Sharma',  'ramesh@medicareclinic.com',  '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '9800011111', 'Cardiologist',      85000, 'Kathmandu', 1, 'active'),
  ('Dr. Sita Thapa',     'sita@medicareclinic.com',    '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '9800022222', 'Dermatologist',     75000, 'Pokhara',   2, 'active'),
  ('Dr. Hari Bahadur',   'hari@medicareclinic.com',    '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '9800033333', 'Neurologist',       90000, 'Kathmandu', 3, 'active'),
  ('Dr. Gita Rai',       'gita@medicareclinic.com',    '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '9800044444', 'Pediatrician',      70000, 'Lalitpur',  4, 'active'),
  ('Dr. Bikash KC',      'bikash@medicareclinic.com',  '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '9800055555', 'Orthopedic',        80000, 'Bhaktapur', 5, 'active'),
  ('Dr. Anup Joshi',     'anup@medicareclinic.com',    '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '9800066666', 'General Physician', 65000, 'Kathmandu', 6, 'active');
  ('Dr. Aarpan adhikari',     'arpan@medicareclinic.com',    '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '9800077777', 'Gynocologist', 69000, 'Kamjung', 7, 'active');

-- Patients Password for all: patient123 //suru ko lagi, paxi signup required
INSERT INTO patients (name, email, password, age, gender, phone, city, blood_group, address, status) VALUES
  ('Ram Prasad',     'ram@patient.com',    '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 35, 'Male',   '9811111111', 'Kathmandu', 'A+',  'Kathmandu, Nepal', 'active'),
  ('Sunita Karki',   'sunita@patient.com', '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 28, 'Female', '9811222222', 'Pokhara',   'B+',  'Pokhara, Nepal',   'active'),
  ('Mohan Tamang',   'mohan@patient.com',  '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 45, 'Male',   '9811333333', 'Lalitpur',  'O+',  'Lalitpur, Nepal',  'active'),
  ('Anita Shrestha', 'anita@patient.com',  '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 32, 'Female', '9811444444', 'Kathmandu', 'AB+', 'Kathmandu, Nepal', 'active'),
  ('Rajan Adhikari', 'rajan@patient.com',  '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 52, 'Male',   '9811555555', 'Bhaktapur', 'A-',  'Bhaktapur, Nepal', 'active'),
  ('Puja Gurung',    'puja@patient.com',   '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 22, 'Female', '9811666666', 'Kathmandu', 'B-',  'Kathmandu, Nepal', 'active'),
  ('Suresh Magar',   'suresh@patient.com', '$2a$10$XQZQ1Z5Z5Z5Z5Z5Z5Z5Z5OxKqG8kZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 60, 'Male',   '9811777777', 'Pokhara',   'O-',  'Pokhara, Nepal',   'inactive');

-- Appointments
INSERT INTO appointments (patient_id, doctor_id, date, time, status, reason) VALUES
  (1, 1, '2025-01-05', '10:00:00', 'Completed',  'Chest pain'),
  (2, 2, '2025-01-08', '11:00:00', 'Completed',  'Skin rash'),
  (3, 3, '2025-01-10', '09:30:00', 'Completed',  'Headache'),
  (4, 4, '2025-01-12', '14:00:00', 'Completed',  'Child fever'),
  (5, 5, '2025-01-15', '10:30:00', 'Completed',  'Knee pain'),
  (6, 1, '2025-02-01', '09:00:00', 'Scheduled',  'Breathing issue'),
  (7, 3, '2025-02-05', '11:30:00', 'Scheduled',  'Dizziness'),
  (1, 2, '2025-02-10', '10:00:00', 'Cancelled',  'Skin allergy'),
  (3, 1, '2025-02-15', '13:00:00', 'Scheduled',  'Follow-up checkup'),
  (2, 4, '2025-02-20', '15:00:00', 'Scheduled',  'Routine checkup'),
  (4, 2, '2025-03-01', '10:00:00', 'Scheduled',  'Skin checkup'),
  (6, 5, '2025-03-10', '11:00:00', 'Scheduled',  'Back pain');

-- Prescriptions
INSERT INTO prescriptions (appointment_id, medicine, dosage, duration, notes) VALUES
  (1, 'Aspirin',      '75mg',  '30 days', 'Take after meals'),
  (1, 'Atorvastatin', '10mg',  '60 days', 'Take at night'),
  (2, 'Cetirizine',   '10mg',  '7 days',  'Take once daily'),
  (3, 'Paracetamol',  '500mg', '5 days',  'Take when needed'),
  (3, 'Ibuprofen',    '400mg', '3 days',  'Take after food'),
  (4, 'Amoxicillin',  '250mg', '7 days',  'Three times a day'),
  (5, 'Diclofenac',   '50mg',  '10 days', 'Apply gel on knee');

-- Bills
INSERT INTO bills (patient_id, appointment_id, service, date, amount, discount, paid, status) VALUES
  (1, 1, 'Cardiology Consultation',    '2025-01-05', 2500, 0,   2500, 'Paid'),
  (2, 2, 'Dermatology Consultation',   '2025-01-08', 1800, 100, 1700, 'Paid'),
  (3, 3, 'Neurology Consultation',     '2025-01-10', 3200, 0,   0,    'Pending'),
  (4, 4, 'Pediatric Consultation',     '2025-01-12', 1500, 0,   1500, 'Paid'),
  (5, 5, 'Orthopedic Consultation',    '2025-01-15', 2200, 200, 0,    'Overdue'),
  (6, 6, 'Cardiology Consultation',    '2025-02-01', 2500, 0,   0,    'Pending'),
  (7, 7, 'Neurology Follow-up',        '2025-02-05', 3200, 300, 2900, 'Paid');