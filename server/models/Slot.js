import mongoose from "mongoose";

const SlotSchema = mongoose.Schema({
    bookingDate: Date,
    isAvailable: Boolean,
    startDate: Date,
    endDate: Date
});

const Slot = mongoose.model('Slot', SlotSchema);
export default Slot;