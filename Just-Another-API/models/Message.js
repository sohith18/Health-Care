import mongoose from "mongoose";

const MessageSchema = mongoose.Schema({
    senderId: {type: String, required: true},
    content: {type: String, required: true},
    type: {type: String, required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
    seenBy: [String] // user ids
});

const Message = mongoose.model('Messages', MessageSchema)
export default Message