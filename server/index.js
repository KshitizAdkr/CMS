const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware 
app.use(cors());
app.use(express.json());

// Routes 
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/doctors',       require('./routes/doctors'));
app.use('/api/patients',      require('./routes/patients'));
app.use('/api/appointments',  require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/bills',         require('./routes/bills'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/reports',       require('./routes/reports'));

//  Health check 
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediCare API is running.' });
});

// Start server 
app.listen(PORT, () => {
  console.log(`✅ MediCare API running on http://localhost:${PORT}`);
});
