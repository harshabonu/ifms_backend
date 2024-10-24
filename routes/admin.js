import express from 'express';
const router = express.Router();
import * as adminController from '../controllers/adminController.js'; // Adjust the path as necessary
 import { isAdmin, authenticate } from '../middleware/auth.js'; // Middleware to check for admin access

// Admin routes
router.post('/createAdmin',authenticate, isAdmin, adminController.createAdmin);
router.post('/createFloorPlan',authenticate, isAdmin,adminController.createFloorPlan);   // Create a new floor plan
router.put('/updateFloorPlan/:id', authenticate, isAdmin, adminController.updateFloorPlan); // Update an existing floor plan
router.post('/resolveConflicts', authenticate, isAdmin,adminController.resolveConflicts);  // Resolve floor plan conflicts
router.post('/versionControl', authenticate, isAdmin, adminController.versionControl);
router.get('/floorPlans',authenticate, adminController.getAllFloorPlans);
router.get('/floorPlans/:id/rooms', authenticate, adminController.getRoomsInFloorPlan);
       // Manage version control for floor plans

// Route to delete a room from a floor plan
router.delete('/floorPlan/:floorPlanId/room/:roomId',  authenticate, isAdmin,adminController.deleteRoom);

// Route to delete an entire floor plan
router.delete('/floorPlan/:id',authenticate, isAdmin, adminController.deleteFloorPlan);


export default router; // Default export of the router
