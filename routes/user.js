import express from 'express';
import userController from '../controllers/userController.js';
import { isAdmin, authenticate } from '../middleware/auth.js'; 
const router = express.Router();

// User routes
router.post('/register', userController.registerUser);      // Register a new user
router.post('/login', userController.loginUser);            // Login route
router.get('/profile',authenticate, userController.getUserProfile);      // Get user profile (requires authentication)
// router.post('/bookRoom', userController.bookRoom);          // Book a room (for users)
router.get('/viewSeats', authenticate,userController.viewSeats);         // View available seats
router.get('/viewFloorPlan',authenticate, userController.viewFloorPlan); // View a floor plan
router.post('/bookRoom',authenticate,  userController.bookRoom);          // Book a room
router.put('/cancelBooking/:floorPlanId/:roomId', authenticate, userController.cancelRoomBooking); // Cancel room booking
// Assuming you have an Express router setup
// router.get('/bookings', userController.getUserBookings); // Fetch bookings for a user
router.get('/mybookings',authenticate, userController.getUserBookedRooms); // Fetch bookings for a user

export default router; // Change to default export
