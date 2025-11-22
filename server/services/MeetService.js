import { getUser } from "./UserService.js";
import env from "dotenv";
import jwt from "jsonwebtoken";
import Role from "../enums/Role.js";
import Meet from "../models/Meet.js";
import { User } from "../models/User.js";

env.config();
const API_KEY = process.env.API_KEY;
const SECRET_MEET_TOKEN = process.env.SECRET_MEET_TOKEN;

// Helper: map backend Role enum to frontend string
const mapRoleForFrontend = (role) => {
  if (role === Role.PATIENT) return "patient";
  if (role === Role.DOCTOR) return "doctor";
  return "unknown";
};

const getMeetDetails = async (token, specialization, callId) => {
  try {
    const userRes = await getUser(token);
    if (userRes.status !== 200) {
      return userRes;
    }

    const user = await User.findById(userRes.user._id);
    if (!user) {
      return { status: 404, msg: "User not found" };
    }

    let meeting = null;

    if (user.role === Role.PATIENT) {
      // Patient always CREATES a new meeting
      if (!specialization) {
        return { status: 400, msg: "Specialization is required for patient" };
      }

      meeting = await new Meet({
        patientId: user._id,
        status: "pending",
        createdAt: new Date(),
        specialization,
      }).save();
    } else if (user.role === Role.DOCTOR) {
      // Doctor JOINS an existing meeting by ID (can be first join or rejoin)
      if (!callId) {
        return { status: 400, msg: "callId is required for doctor" };
      }

      meeting = await Meet.findOneAndUpdate(
        { _id: callId },
        { $set: { doctorId: user._id } },
        { new: true }
      );

      if (!meeting) {
        return { status: 404, msg: "Meeting not found" };
      }
    } else {
      return { status: 403, msg: "User role not allowed for meetings" };
    }

    const meetToken = jwt.sign(
      {
        user_id: userRes.user._id,
        iat: Math.floor(Date.now() / 1000) - 30,
      },
      SECRET_MEET_TOKEN,
      { expiresIn: "1h" }
    );

    return {
      status: 200,
      msg: "OK",
      user: userRes.user,
      role: mapRoleForFrontend(user.role), // "doctor" | "patient" for frontend
      callId: meeting ? meeting._id : null,
      apiKey: API_KEY,
      token: meetToken,
    };
  } catch (err) {
    console.error("getMeetDetails error", err);
    return { status: 500, msg: "Internal server error" };
  }
};

const deleteMeetDetails = async (token, callId) => {
  try {
    const userRes = await getUser(token);
    if (userRes.status !== 200) {
      return userRes;
    }

    const user = userRes.user;

    // Only patient or doctor can delete a meeting
    if (user.role !== Role.PATIENT && user.role !== Role.DOCTOR) {
      return { status: 403, msg: "User not allowed to delete meeting" };
    }

    if (!callId) {
      return { status: 400, msg: "callId is required" };
    }

    const meeting = await Meet.findOneAndDelete({ _id: callId });
    if (!meeting) {
      return { status: 404, msg: "Meeting not found" };
    }

    return { status: 200, msg: "Meeting deleted successfully" };
  } catch (err) {
    console.error("deleteMeetDetails error", err);
    return { status: 500, msg: "Internal server error" };
  }
};

export { getMeetDetails, deleteMeetDetails };
