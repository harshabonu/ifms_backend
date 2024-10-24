import mongoose from 'mongoose';

const conflictSchema = new mongoose.Schema({
    floorPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'FloorPlan', required: true },
    adminChanges: { type: Object, required: true },
    userChanges: { type: Object, required: true },
    priority: { type: String, enum: ['admin', 'timestamp'], default: 'timestamp' },
    status: { type: String, enum: ['unresolved', 'resolved'], default: 'unresolved' },
    timestamp: { type: Date, default: Date.now }
});

const Conflict = mongoose.model('Conflict', conflictSchema);
export default Conflict; // Use export default
