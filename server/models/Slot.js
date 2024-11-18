import mongoose from "mongoose";

const SlotSchema = mongoose.Schema({
    isAvailable: Boolean,
    timeInterval: String,
    capacity: Number,
});

const Slot = mongoose.model('Slot', SlotSchema);
export default Slot;