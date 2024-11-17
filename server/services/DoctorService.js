import { User } from "../models/User.js"
import Role from "../enums/Role.js"

const getAllDoctors = async () => {
    try {
        const doctors = await User.find({ role: Role.Doctor })
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
    getAllDoctors
}