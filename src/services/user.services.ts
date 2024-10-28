import User from "../models/user.model.js";


export const userCreate = async (data: {
    username: string;
    password: string;
}) => {
    const user = await User.create(data);
    return user;
}