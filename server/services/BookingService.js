import Slot from "../models/Slot.js";
import Booking from "../models/Booking.js";
import Role from "../enums/Role.js";
import { getUser } from "./UserService.js";
import Prescription from "../models/Prescription.js";


const createBooking = async (token, bookingData) => {
    try {

        if (!bookingData || typeof bookingData !== 'object' || !bookingData.doctorID || !bookingData.slotID) {
            return { status: 400, msg: "Invalid booking data provided" };
        }
        let bookedSlot = bookingData.slotID;
        bookedSlot = await Slot.findById(bookedSlot);
        
        if (!bookedSlot) {
            return { status: 404, msg: "Slot not found" };
        }
        if (bookedSlot.capacity === 0) {
            return { status: 400, msg: "Slot is full" };
        }
        bookedSlot.capacity = bookedSlot.capacity - 1;
        const updatedSlot = await Slot.updateOne({ _id: bookedSlot._id }, { $set: { capacity: bookedSlot.capacity } });
        if (!updatedSlot) {
            return { status: 500, msg: "Error while updating slot" };
        }
        bookingData.slot = bookedSlot._id;

        const userRes = await getUser(token);
        if (userRes.status !== 200) return userRes;
        if (userRes.user.role !== Role.PATIENT) {
            return { status: 404, msg: "User is not a patient" };
        }
        const patientID = userRes.user._id;

        console.log("updated slot", updatedSlot);
        const booking = await Booking.create({
            patient: patientID,
            doctor: bookingData.doctorID,
            slot: bookingData.slotID,
            prescription: bookingData.prescription
        });
        if (!booking) {
            return { status: 500, msg: "Error while creating booking" };
        }

        return { status: 200, msg: "Booking created successfully", booking: booking };

    }
    catch (err) {
        console.log(err);
        return { status: 500, msg: err.name };
    }
}

const getBookings = async (token) => {
    try {
        const userRes = await getUser(token);
        if (userRes.status !== 200) return userRes;
        const userID = userRes.user._id;
        let bookings = null;

        if (userRes.user.role === Role.PATIENT)
            bookings = await Booking.find({ patient: userID })
                .populate('patient')
                .populate('doctor')
                .populate('slot')
                .populate('prescription')
        else if (userRes.user.role === Role.DOCTOR)
            bookings = await Booking.find({ doctor: userID })
                .populate('patient')
                .populate('doctor')
                .populate('slot')
                .populate('prescription')

        if (!bookings)
            return { status: 500, msg: "Error while fetching bookings" };

        return { status: 200, msg: "Bookings fetched successfully", bookings: bookings };

    }
    catch (err) {
        console.log(err);
        return { status: 500, msg: err.name };
    }
}

const addPrescription = async (token, body) => {
    try {
        const bookingID = body.bookingID;
        const medicines = body.medicines; // contains [{medicine_name, dosage}]
        const comments = body.comments;
        const userRes = await getUser(token);
        if (userRes.status !== 200) return userRes;

        const booking = await Booking.findById(bookingID);
        if (!booking)
            return { status: 404, msg: "Booking not found" };

        if (userRes.user.role === Role.PATIENT)
            return { status: 403, msg: "Patient not authorized"};

        if (userRes.user.role === Role.DOCTOR && booking.doctor.toString() !== userRes.user._id.toString())
            return { status: 403, msg: "Doctor not authorized" };

        // create prescrtiption object
        const prescription = await Prescription.create({
            medicines: medicines,
            comments: comments
        });
        if (!prescription)
            return { status: 500, msg: "Error while creating prescription" };


        // // delete existing prescription
        // if (booking.prescription) {
        //     const deletedPrescription = await Prescription.deleteOne({ _id: booking.prescription });
        //     if (!deletedPrescription)
        //         return { status: 500, msg: "Error while deleting prescription" };
        // }
        // Update the booking
        const updatedBooking = await Booking.updateOne(
            { _id: bookingID },
            { $set: { prescription: prescription._id } }
        );

        if (!updatedBooking)
            return { status: 500, msg: "Error while updating booking" };

        // Fetch the updated booking with populated fields
        const populatedBooking = await Booking.findById(bookingID).populate('prescription');

        if (!populatedBooking)
            return { status: 404, msg: "Booking not found after update" };

        return {
            status: 200,
            msg: "Prescription added successfully",
            booking: populatedBooking
        };

    }
    catch (err) {
        console.log(err);
        return { status: 500, msg: err.name };
    }
}

export {
    createBooking,
    getBookings,
    addPrescription
}