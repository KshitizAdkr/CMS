# 🏥 MediCare — Clinic Management System
### A Database Driven Approach to Healthcare & Clinical Operations.

---

## Overview
**MediCare** is a comprehensive full-stack clinic management platform designed with a **database-first architecture**. It streamlines clinical workflows—from patient registration and appointment scheduling to electronic prescriptions and automated billing—while maintaining strict relational data integrity and providing real-time administrative insights through advanced SQL engineering.

## Features
*   **Patient Portal**: Personalized dashboards for health summaries, intuitive appointment booking with doctor specialization filtering, and secure access to prescription/billing history.
*   **Doctor Dashboard**: Real-time management of daily schedules, role-scoped patient history access, and integrated clinical treatment records.
*   **Admin Insights**: Powerful business intelligence visualizing revenue trends, appointment volume, and staff workload distribution.
*   **Secure Access**: Multi-role authentication (Patient, Doctor, Admin) enforced via JWT and RBAC at both the API and database layers.
*   **Premium UI**: Modern glassmorphism design language with full dark mode support and a highly responsive layout.

## 🛠️ Technologies Used
*   **Frontend**: React (Vite), Vanilla CSS (Custom Design System), Chart.js.
*   **Backend**: Node.js, Express.
*   **Database**: SQLite (via `better-sqlite3`) — Optimized for high-performance relational operations and ACID compliance.

## 🗄️ Database Structure & Queries
The system is built on a highly normalized relational schema (7+ core entities) located at `server/medicare.db`. 

### Interactive Database Explorer
To inspect the database from your terminal:
```bash
sqlite3 server/medicare.db
```

Then, format the outputs for high readability by running these interactive commands:
```sql
.mode box
.header on
```

### Key Analytical Queries
MediCare leverages advanced SQL patterns to drive clinical and financial intelligence:

**1. Monthly Revenue Trends**
*Summarizes financial health by grouping invoiced amounts by month.*
```sql
SELECT 
    strftime('%Y-%m', IssuedAt) AS Month, 
    SUM(Amount) AS Total_Invoiced, 
    COUNT(*) AS Invoice_Count
FROM Bills 
GROUP BY Month 
ORDER BY Month DESC;
```

**2. Doctor Workload Distribution**
*Analyzes staff capacity by calculating total appointments vs. completed treatments.*
```sql
SELECT 
    d.Name, d.Specialization,
    COUNT(a.AppointmentId) AS Total_Appts,
    SUM(CASE WHEN a.Status = 'Completed' THEN 1 ELSE 0 END) AS Completed
FROM Doctors d
LEFT JOIN Appointments a ON d.DoctorId = a.DoctorId
GROUP BY d.DoctorId
ORDER BY Total_Appts DESC;
```

**3. Advanced Clinical JOIN (Recent Activity)**
*Combines Appointment, Patient, and Doctor data to provide a unified clinical record.*
```sql
SELECT 
    a.AppDate, a.Status, 
    p.Name AS Patient, 
    d.Name AS Doctor, d.Specialization
FROM Appointments a
JOIN Patients p ON a.PatientId = p.PatientId
JOIN Doctors d ON a.DoctorId = d.DoctorId
ORDER BY a.AppDate DESC LIMIT 5;
```

##  How to Run

### 1. Backend Setup (Node.js)
```bash
cd server
npm install
node setup-db.js  # Optional: Re-initializes schema with seed data
npm run dev
```
*API will be running at `http://localhost:5000`*

### 2. Frontend Setup (React/Vite)
```bash
cd client
npm install
npm run dev
```
*Dashboard will be accessible at `http://localhost:5173`*