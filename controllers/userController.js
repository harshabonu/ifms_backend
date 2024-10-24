import User from '../models/User.js';
import FloorPlan from '../models/FloorPlan.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    // Find the user to create the JWT token
    const usere = await User.findOne({ email });

    // Include username in the JWT payload
    const token = jwt.sign(
      { userId: usere._id, role: usere.role, username: usere.username },
      'secretKey',
      { expiresIn: '1h' }
    );

    // Send a single response
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Include username in the JWT payload
    const token = jwt.sign({ userId: user._id, role: user.role, username: user.username }, 'secretKey', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // Book a room
// const bookRoom = async (req, res) => {
//   try {
//     const { roomId } = req.body;
//     const floorPlan = await FloorPlan.findOne({ 'rooms._id': roomId });
//     const room = floorPlan.rooms.id(roomId);
//     if (room.booked) {
//       return res.status(400).json({ message: 'Room already booked' });
//     }
//     room.booked = true;
//     await floorPlan.save();
//     res.status(200).json({ message: 'Room booked successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// View available seats
const viewSeats = async (req, res) => {
  try {
    const floorPlans = await FloorPlan.find({ 'seats.occupied': false });
    res.status(200).json(floorPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View a floor plan
const viewFloorPlan = async (req, res) => {
  try {
    const { floorPlanId } = req.query;
    const floorPlan = await FloorPlan.findById(floorPlanId);
    res.status(200).json(floorPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Book a room
const bookRoom = async (req, res) => {
  try {
    const { roomId, floorPlanId } = req.body;
    const floorPlan = await FloorPlan.findById(floorPlanId);


    // console.log("the log was", req);

    if (!floorPlan) {
      return res.status(404).json({ message: 'Floor plan not found' });
    }

    const room = floorPlan.rooms.id(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.booked) {
      return res.status(400).json({ message: 'Room already booked' });
    }

    // Mark the room as booked and assign the user who booked it
    room.booked = true;
    room.bookedBy = req.user.userId; // Assuming req.user contains the userId

    // console.log()
    await floorPlan.save(req.user.userId);

    res.status(200).json({ message: 'Room booked successfully', floorPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// In your booking controller
const getUserBookedRooms = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming this is the fixed user ID

    console.log(userId);

    // Find all floor plans that contain rooms booked by the user
    const floorPlans = await FloorPlan.find({ "rooms.bookedBy": userId }).select('name rooms'); // Ensure 'name' and 'rooms' are selected

    // Extract rooms booked by this user along with floor plan names, room IDs, and floor plan IDs
    const bookedRooms = floorPlans.map(floorPlan => {
      return floorPlan.rooms
        .filter(room => room.bookedBy && room.bookedBy.toString() === userId.toString())
        .map(room => ({
          roomId: room._id,               // Add roomId to the response
          roomNumber: room.roomNumber,
          floorPlanId: floorPlan._id,      // Add floorPlanId to the response
          floorPlanName: floorPlan.name    // The floor plan name
        }));
    }).flat(); // Flatten the array to get all rooms in a single array

    // Check if no bookings were found
    if (bookedRooms.length === 0) {
      return res.status(404).json({ message: 'No booked rooms found for this user' });
    }

    // Return the list of booked rooms in a structured format
    res.status(200).json({ bookedRooms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};




// Cancel room booking
// Cancel booking API
const cancelRoomBooking = async (req, res) => {
  try {


    const { roomId, floorPlanId } = req.params; // Assume these are passed as parameters
    console.log(roomId);
    console.log(floorPlanId);
    // Find the floor plan containing the room
    const floorPlan = await FloorPlan.findOne({ _id: floorPlanId, "rooms._id": roomId });

    if (!floorPlan) {
      return res.status(404).json({ message: 'Room or Floor Plan not found' });
    }

    // Find the specific room within the floor plan and update it
    const room = floorPlan.rooms.id(roomId);
    if (!room || !room.bookedBy) {
      return res.status(400).json({ message: 'Room is not currently booked' });
    }

    room.booked = false;
    room.bookedBy = null;

    // Save the updated floor plan
    await floorPlan.save();

    res.status(200).json({ message: 'Booking canceled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// Default export
export default {
  registerUser,
  loginUser,
  getUserProfile,
  bookRoom,
  viewSeats,
  viewFloorPlan,
  cancelRoomBooking,
  getUserBookedRooms

};
