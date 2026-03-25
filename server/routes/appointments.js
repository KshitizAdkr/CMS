// Appointment Routes
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/appointments
router.get('/', authenticate, appointmentController.getAllAppointments);

// GET /api/appointments/:id
router.get('/:id', authenticate, appointmentController.getAppointmentById);

// POST /api/appointments
router.post('/', authenticate, authorize('admin', 'patient'), appointmentController.createAppointment);

// PUT /api/appointments/:id
router.put('/:id', authenticate, authorize('admin', 'doctor'), appointmentController.updateAppointment);

// DELETE /api/appointments/:id
router.delete('/:id', authenticate, authorize('admin'), appointmentController.deleteAppointment);

module.exports = router;
