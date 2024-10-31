// simple schema for a grp chat
import mongoose from "mongoose";

const ChatSchema = mongoose.Schema({
    name: { type: String, unique: true, required: true },
    picture: String,
    members: [String], // user ids
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }] // fk to message model
});

const Chat = mongoose.model('Chats', ChatSchema);
export default Chat;