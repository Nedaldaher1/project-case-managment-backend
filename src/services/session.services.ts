import { sequelize, Op } from '../config/db'; // استيراد Op بالإضافة إلى sequelize
import Session from "../models/session";
import bcrypt from 'bcrypt'

export const generateSessionId = async () => {
    return await bcrypt.hash(new Date().toString(), 10);
}

export const createSession = async (data: {
    sessionId: string,
    sessionData: {
        uuid: string,
    },
}) => {
    await Session.create({
        sessionId: data.sessionId,
        sessionData: data.sessionData,
        expiresAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
    });
}

export const getSession = async (sessionId: string) => {
    const session = await Session.findOne({ where: { sessionId, expiresAt: { [Op.gt]: new Date() } } }) as any;
    return session ? session.sessionData : null;
}

export const renewalSession = async (sessionId: string) => {
    const session = await Session.findOne({ where: { sessionId } }) as any;
    if (!session) {
        return false;
    }
    session.expiresAt = new Date(new Date().getTime() + 1000 * 60 * 60 );
    await session.save();
    return true;
}
export const deleteSession = async (sessionId: string) => {
    await Session.destroy({ where: { sessionId } });
}