import Role from "../enums/Role.js";
import Meet from "../models/Meet.js";
import { getUser } from "./UserService.js";
import env from "dotenv";
import jwt from "jsonwebtoken";

env.config();

const getHeartBeat = async (token) => {
  try {
    const user = await getUser(token);
    if (user.status !== 200) return user;
    if (user.user.role !== Role.DOCTOR) {
      return { status: 404, msg: "User is not a doctor" };
    }

    // If doctor already has a pending meeting, use that so they can rejoin
    const existing = await Meet.findOne({
      doctorId: user.user._id,
      status: "pending",
    });
    if (existing) {
      const meetToken = jwt.sign(
        { user_id: user.user._id },
        process.env.SECRET_MEET_TOKEN,
        { expiresIn: "1h" },
      );

      return {
        status: 200,
        msg: "You have a meeting scheduled",
        callId: existing._id,
        specialization: existing.specialization,
        apiKey: process.env.API_KEY,
        token: meetToken,
      };
    }

    // Look for a pending meet in any of the doctor's specializations
    const specs = user.user.specializations || [];
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];

      const meets = await Meet.find({
        specialization: spec,
        status: "pending",
      });

      console.log("--------------- raw meets", meets, spec);
      const filteredMeet = meets.filter(
        (m) => m.rejectedBy.indexOf(user.user._id) === -1,
      );
      console.log("--------------- filtered", filteredMeet);

      if (filteredMeet.length > 0) {
        const m = filteredMeet[0];

        const meetToken = jwt.sign(
          { user_id: user.user._id },
          process.env.SECRET_MEET_TOKEN,
          { expiresIn: "1h" },
        );

        return {
          status: 200,
          msg: "You have a meeting scheduled",
          callId: m._id,
          specialization: m.specialization, // important for frontend
          apiKey: process.env.API_KEY,
          token: meetToken,
        };
      }
    }

    return {
      status: 200,
      msg: "No meetings scheduled",
    };
  } catch (err) {
    console.log(err);
    return { status: 500, msg: err.name || "Internal server error" };
  }
};

const rejectHeartBeat = async (token, callId) => {
  try {
    const user = await getUser(token);
    if (user.status !== 200) return user;
    if (user.user.role !== Role.DOCTOR) {
      return { status: 404, msg: "User is not a doctor" };
    }

    if (!callId) {
      return { status: 400, msg: "callId is required" };
    }

    const meet = await Meet.findOne({ _id: callId });
    if (!meet) return { status: 404, msg: "Meeting not found" };

    if (meet.rejectedBy.indexOf(user.user._id) === -1) {
      meet.rejectedBy.push(user.user._id);
      await meet.save();
    }

    return {
      status: 200,
      msg: "Meeting rejected",
    };
  } catch (err) {
    console.log(err);
    return { status: 500, msg: err.name || "Internal server error" };
  }
};

export { getHeartBeat, rejectHeartBeat };
