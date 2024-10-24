import mongoose, { Schema, model } from "mongoose";

const floorPlanSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    rooms: [
        {
            roomNumber: {
                type: Number,
                required: true,
            },
            capacity: {
                type: Number,
                required: true,
            },
            booked: {
                type: Boolean,
                default: false,
            },
            bookedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',  // Reference to User model
                default: null,
            },
            seats: [
                {
                    seatNumber: {
                        type: Number,
                        required: true,
                    },
                    occupied: {
                        type: Boolean,
                        default: false,
                    },
                },
            ],
        },
    ],
    version: {
        type: Number,
        required: true,
        default: 1,
    },
    lastModified: {
        type: Date,
        default: Date.now,
    },
    modifiedBy: {
        type: String,
        required: true,
    },
    conflictFlag: {
        type: Boolean,
        default: false,
    },
    priority: {
        type: Number,
        default: 0,
    },
    mergeStatus: {
        type: String,
        default: 'pending',
    },
});

// Use default export for the model
const FloorPlan = mongoose.models.Floorplan || model("Floorplan", floorPlanSchema);
export default FloorPlan;
