import { Doctor, User } from "../models/User.js"
import Role from "../enums/Role.js"
import { getUser } from "./UserService.js"
import Slot from "../models/Slot.js";



const updateDoctor = async (token, docData) => {
    try {
        const userRes = await getUser(token);
        if (userRes.status !== 200) return userRes;

        const doctor = userRes.user;
        if (doctor.role !== Role.DOCTOR) {
            return { status: 404, msg: "User is not a doctor" };
        }
        if (!docData || typeof docData !== 'object') {
            return { status: 400, msg: "Invalid doctor data provided" };
        }

        const allowedUpdates = [
            'qualifications',
            'specializations',
            'experience',
            'description',
            'gender',
            'slots',
        ];
        const sanitizedData = Object.keys(docData)
            .filter((key) => allowedUpdates.includes(key))
            .reduce((acc, key) => {
                acc[key] = docData[key];
                return acc;
            }, {});

        if (sanitizedData.slots) {
            if (!Array.isArray(sanitizedData.slots)) {
                return { status: 400, msg: "Slots must be an array" };
            }
            sanitizedData.slots = await Promise.all(docData.slots.map(async (slot) => {
                if (!slot || !slot.isAvailable || !slot.startingTime || !slot.endingTime || !slot.capacity) {
                    throw new Error("Invalid slot data provided");
                }
                return await Slot.create({
                    isAvailable: slot.isAvailable,
                    timeInterval: slot.startingTime + ' - ' + slot.endingTime,
                    capacity: slot.capacity,
                });
            }));
        }
                    
        const deleteExistingSlots = await Slot.deleteMany({ _id: { $in: doctor.slots } });
        if (!deleteExistingSlots) {
            return { status: 500, msg: "Failed to update doctor" };
        }

        const updatedDoctor = await Doctor.findOneAndUpdate(
            { _id: doctor._id },
            { $set: {...sanitizedData, __t: 'user'} },
            { new: true }
        ).populate('slots');
        
        if (!updatedDoctor) {
            return { status: 500, msg: "Failed to update doctor" };
        }

        return {
            status: 200,
            user: updatedDoctor,
            msg: "Updated successfully",
        };
    } catch (e) {
        console.error(e);
        return {
            status: 500,
            msg: e.message,
        };
    }
};


const getAllDoctors = async (data) => {
    try {
        console.log(data)
        // update here
        const filterFields = {
            id: (value) => ({ _id: value }),
            name: (value) => ({ name: { $regex: value, $options: 'i' } }),
            gender: (value) => ({ gender: value }),
            experience: (value) => ({ experience: value }),
            specialization: (value) => ({ specializations: value }),
        };
        
        const body = Object.keys(filterFields).reduce((acc, key) => {
            if (data[key]) {
                return { ...acc, ...filterFields[key](data[key]) };
            }
            return acc;
        }, {});
        
        const doctors = await User.find({ role: Role.DOCTOR, ...body }).populate('slots');
        
        return {
            status: 200,
            msg: "success",
            doctors: doctors
        }
    }
    catch (err) {
        console.error(err)
        return {
            status: 500,
            msg: err.name,
        }
    }
}
export {
    getAllDoctors,
    updateDoctor
}