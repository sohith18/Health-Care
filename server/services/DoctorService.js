import { User } from "../models/User.js"
import Role from "../enums/Role.js"

const getAllDoctors = async (data) => {
    try {
        console.log(data)
        let body = {};
        if(data.id)
            body = { ...body, _id: data.id }
        if (data.name)
            body = { ...body,  name: { $regex: data.name, $options: 'i' } }
        if (data.gender)
            body = { ...body,  gender: data.gender }
        if (data.experience)
            body = { ...body,  experience: data.experience }
        if (data.specialization)
            body = { ...body,  specializations: data.specialization }
        const doctors = await User.find({ role: Role.Doctor, ...body })
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