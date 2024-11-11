import User from "../models/user.model";


export const userCreate = async (data: {
    username: string;
    password: string;
    role: string;
}) => {
    const user = await User.create(data);
    return user;
}

export const userUpdate = async (id: string, data: {
    username: string;
    password: string;
    role: string;
}) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }
    await user.update(data);
    return user;
}

export const userDelete = async (id: string) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }
    await user.destroy();
    return user;    
}

export const userFindAll = async () => {
    const users = await User.findAll();
    return users;
}
