// userController.js
import {jwtDecode} from "jwt-decode";            // corrected import
import { User } from '../models/User.js';
import Slot  from '../models/Slot.js';      // make sure Slot model exists & exported
import bcrypt from 'bcrypt';
 
const saltRounds = 10;

const getUser = async (token) => {
  try {
    if (!token) throw new Error("No token provided");

    const decoded = jwtDecode(token);
    const user = await User.findOne({ _id: decoded._id }).lean();

    if (!user) {
      return { user: null, msg: "User not found", status: 404 };
    }

    // If doctor, populate slots by fetching Slot docs whose ids are in user.slots
    let populatedSlots = [];
    if (user.role === "DOCTOR" || user.role === "Doctor") {
      if (Array.isArray(user.slots) && user.slots.length > 0) {
        populatedSlots = await Slot.find({ _id: { $in: user.slots } }).lean();
      }
    }

    // Send back user with slots replaced by the populated slot objects (if any)
    const userToReturn = {
      ...user,
      slots: populatedSlots.length > 0 ? populatedSlots : user.slots || [],
    };

    return {
      msg: "found user",
      status: 200,
      user: userToReturn,
    };
  } catch (err) {
    console.error("getUser error:", err);
    if (err.code === 11000) {
      return { user: null, msg: err.name, status: 409 };
    }
    return { user: null, msg: err.message || err.name, status: 500 };
  }
};


const updateUser = async (userData) => {
  try {
    if (!userData || !userData._id) {
      return { user: null, msg: "Missing user _id", status: 400 };
    }

    // Hash password if provided
    if (userData.password) {
      const pass = userData.password;
      const hash = await bcrypt.hash(pass, saltRounds);
      userData.password = hash;
    }

    // findOneAndUpdate needs a filter, update object and options
    const updated = await User.findOneAndUpdate(
      { _id: userData._id },
      { $set: userData },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return { user: null, msg: "User not found", status: 404 };
    }

    return {
      user: updated,
      msg: 'updated user',
      status: 200
    };
  } catch (err) {
    console.error("updateUser error:", err);
    return { user: null, msg: err.message || err.name, status: 500 };
  }
};


export {
  getUser,
  updateUser
};
