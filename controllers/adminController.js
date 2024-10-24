import FloorPlan from '../models/FloorPlan.js';
import Conflict from '../models/Conflict.js'; // Conflict model to track unresolved conflicts
import User from '../models/User.js'; // Ensure you import User model
import bcrypt from 'bcrypt'; // If using bcrypt for password hashing

// Create a new admin
export const createAdmin = async (req, res) => {
    try {
        // Check if the current user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create other admins' });
        }

        const { username, email, password } = req.body;

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new admin user
        const newAdmin = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin'  // Explicitly set the role to admin
        });

        await newAdmin.save();

        res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// export const createFloorPlan = async (req, res) => {
//     try {
//         const { name, description, rooms, seats } = req.body;
//         const floorPlan = new FloorPlan({ name, description, rooms, seats, version: 1 });
//         await floorPlan.save();
//         res.status(201).json({ message: 'Floor plan created successfully', floorPlan });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

export const createFloorPlan = async (req, res) => {
    try {
        const { name, description, rooms } = req.body; // Adjust if 'seats' is needed

        // Create the new floor plan

        
        const floorPlan = new FloorPlan({ 
            name, 
            description, 
            rooms, 
            version: 1,
            lastModified: Date.now(), // Set the lastModified field
            modifiedBy:req.user.username  // Assuming you have the username from req.user
        });

        await floorPlan.save();
        res.status(201).json({ message: 'Floor plan created successfully', floorPlan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an existing floor plan with version control
export const updateFloorPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const floorPlan = await FloorPlan.findById(id);
       

        if (!floorPlan) {
            return res.status(404).json({ message: 'Floor plan not found' });
        }
        floorPlan.modifiedBy = req.user.username;

        // Handle version control - increment version on every update
        const newVersion = floorPlan.version + 1;
        updatedData.version = newVersion;

        const updatedFloorPlan = await FloorPlan.findByIdAndUpdate(id, updatedData, { new: true });

        res.status(200).json({ message: 'Floor plan updated successfully', updatedFloorPlan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Delete a room from a floor plan
export const deleteRoom = async (req, res) => {
    try {
        const { floorPlanId, roomId } = req.params; // Assuming roomId is passed as a parameter

        // Find the floor plan
        const floorPlan = await FloorPlan.findById(floorPlanId);

        if (!floorPlan) {
            return res.status(404).json({ message: 'Floor plan not found' });
        }

        // Find and remove the room
        const roomIndex = floorPlan.rooms.findIndex(room => room._id.toString() === roomId);
        
        if (roomIndex === -1) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Remove the room
        floorPlan.rooms.splice(roomIndex, 1);
        await floorPlan.save();

        res.status(200).json({ message: 'Room deleted successfully', floorPlan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Delete a floor plan
export const deleteFloorPlan = async (req, res) => {
    try {
        const { id } = req.params; // Floor plan ID from parameters

        // Find and delete the floor plan
        const deletedFloorPlan = await FloorPlan.findByIdAndDelete(id);

        if (!deletedFloorPlan) {
            return res.status(404).json({ message: 'Floor plan not found' });
        }

        res.status(200).json({ message: 'Floor plan deleted successfully', deletedFloorPlan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllFloorPlans = async (req, res) => {
    try {
        // Fetch all floor plans from the database
        const floorPlans = await FloorPlan.find(); // You can add conditions or sorting if needed
        // console.log(floorPlans)
        res.status(200).json({ floorPlans });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

 // Adjust the import path as necessary

export const getRoomsInFloorPlan = async (req, res) => {
    try {
        const { id } = req.params; // Get the floor plan ID from the URL

        // Fetch the floor plan by ID
        const floorPlan = await FloorPlan.findById(id);
        if (!floorPlan) {
            return res.status(404).json({ message: 'Floor plan not found' });
        }

        // Return the rooms associated with the floor plan
        res.status(200).json({ rooms: floorPlan.rooms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Conflict resolution based on timestamp and user role
export const resolveConflicts = async (req, res) => {
    try {
        const { conflictId } = req.body;
        const conflict = await Conflict.findById(conflictId);

        if (!conflict) {
            return res.status(404).json({ message: 'Conflict not found' });
        }

        const { adminChanges, userChanges, priority } = conflict;

        let resolvedPlan;
        // Resolve conflicts based on priority
        if (priority === 'admin') {
            resolvedPlan = adminChanges;
        } else if (priority === 'timestamp') {
            const latestChanges = adminChanges.timestamp > userChanges.timestamp ? adminChanges : userChanges;
            resolvedPlan = latestChanges;
        } else {
            // If no clear priority, merge the two changes
            resolvedPlan = mergeChanges(adminChanges, userChanges);
        }

        // Apply resolved changes to the floor plan
        const floorPlan = await FloorPlan.findByIdAndUpdate(conflict.floorPlanId, resolvedPlan, { new: true });
        conflict.status = 'resolved';
        await conflict.save();

        res.status(200).json({ message: 'Conflict resolved successfully', floorPlan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Version control for floor plans - history management
export const versionControl = async (req, res) => {
    try {
        const { floorPlanId } = req.body;
        const floorPlan = await FloorPlan.findById(floorPlanId);

        if (!floorPlan) {
            return res.status(404).json({ message: 'Floor plan not found' });
        }

        // Fetch version history
        const versionHistory = floorPlan.versionHistory || [];

        res.status(200).json({ message: 'Version control history retrieved', versionHistory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to merge changes (admin and user changes)
const mergeChanges = (adminChanges, userChanges) => {
    return {
        ...adminChanges,
        rooms: userChanges.rooms ? userChanges.rooms : adminChanges.rooms,
        seats: userChanges.seats ? userChanges.seats : adminChanges.seats
    };
};
