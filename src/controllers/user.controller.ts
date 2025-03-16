import { userCreate, userUpdate, userDelete, userFindAll } from "../services/user.services";
import bcrypt from 'bcrypt';
import User from "../models/user.model";
import { Request, Response, RequestHandler, NextFunction } from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import Backup from "../models/backup.model"; // Ensure the model path is correct
import speakeasy from 'speakeasy';
import { generateQRCode } from "../utils/utils_login";
import jwt from 'jsonwebtoken';
import {verifyJWT} from '../utils/utils_login'

// Helper function to issue JWT
const createToken = (user: any) => {
    const payload = {
        id: user.get('id'),
        username: user.get('username'),
        role: user.get('role'),
        memberNumber: user.get('member_id')
    };
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';
    // You can adjust the token expiration time as needed
    return jwt.sign(payload, secret, { expiresIn: '8h' });
};

export const createUser: RequestHandler = async (req: Request, res: Response) => {
    try {
        let { username, password, role } = req.body;
        username = username?.trim();
        password = password?.trim();

        if (!username) {
            res.status(400).json({ message: 'Username is required' });
            return;
        } else if (!password) {
            res.status(400).json({ message: 'Password is required' });
            return;
        } else {
            const userExists = await User.findOne({ where: { username } });
            if (userExists) {
                res.status(400).json({ message: 'Username already exists' });
                return;
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                const secret2FA = speakeasy.generateSecret({ length: 20 });

                const user = await userCreate({ username, password: hashedPassword, role, secret2FA });
                const id = user.get('id') as string;

                if (!id) {
                    throw new Error('User ID not found');
                }

                await generateQRCode(id, user.get('username') as string);

                res.json({
                    message: 'User created successfully. Please proceed with 2FA verification.',
                    user: { id, username, role }
                });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
};

export const enable2FA: RequestHandler = async (req: Request, res: Response) => {
    try {
        const uuid = req.params.id;
        const user = await User.findByPk(uuid);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const secret2FA = user.get('secret2FA') as string;
        if (!secret2FA) {
            res.status(404).json({ message: '2FA secret not found' });
            return;
        }
        await User.update({ is_2fa_enabled: true }, { where: { id: uuid } });

        res.json({ message: '2FA enabled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
};

export const verifyToken2FAHandler: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { token, uuid } = req.body;
        const user = await User.findByPk(uuid);

        if (!user) {
            console.log('User not found');
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const userSecret2FA = user.get('secret2FA') as { base32: string };
        if (!userSecret2FA) {
            console.log('2FA secret not found');
            res.status(404).json({ message: '2FA secret not found' });
            return;
        }

        const verified = speakeasy.totp.verify({
            secret: userSecret2FA.base32,
            encoding: 'base32',
            token,
            window: 4,
        });

        if (!verified) {
            console.log('Invalid token');
            res.status(401).json({ message: 'Invalid token' });
            return;
        }

        // After verification, issue JWT
        const jwtToken = createToken(user);
        console.log("Token issued for user:", user.get('username'));

        res.status(200).json({ message: 'Token verified successfully', token: jwtToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
};

export const userLogin: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }

        const user = await User.findOne({ where: { username } });

        if (!user || !await bcrypt.compare(password, user.get('password') as string)) {
            res.status(401).json({ message: 'Invalid username or password' });
            return;
        }

        console.log('User found:', user.get('username'));
        // Do not issue a token here because 2FA verification will follow
        res.json({ message: 'Username and password verified successfully. Please proceed with 2FA verification.', user: { id: user.get('id'), username: user.get('username'), member_id: user.get('member_id'), role: user.get('role') } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
};



export const userAuthentication: RequestHandler = async (req, res, next) => {
    try {
        console.log('User authenticated:', (req as any).user); 

        if (!(req as any).user) {
            res.status(401).json({ message: 'Unauthorized - Please log in' });
            return;
        }

        res.json({
            message: 'User is authenticated',
            user: (req as any).user
        });
    } catch (error) {
        next(error); // تمرير الخطأ إلى middleware معالجة الأخطاء
    }
};
export const userEdit: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { username, password, role } = req.body;
        const id = req.params.id;
        if (!username) {
            res.status(400).json({ message: 'Username is required' });
            return;
        }
        if (!password) {
            res.status(400).json({ message: 'Password is required' });
            return;
        }

        const user = await User.findByPk(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const getUsrname = user.get('username') as string;
        if (username === getUsrname) {
            res.status(400).json({ message: "Username already exists, cannot add or update." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await userUpdate(id, { username, password: hashedPassword, role });
        const userRoleFromDb = updatedUser.get('role') as string;
        const memberNumber = updatedUser.get('member_id') as number;

        res.json({
            user: { id: user.get('id'), username, role: userRoleFromDb, memberNumber },
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
};

export const userDeleteById: RequestHandler = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const user = await User.findByPk(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const deletedUser = await userDelete(id);
        res.json({ user: deletedUser, message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
};

export const getAllUsers: RequestHandler = async (req: Request, res: Response) => {
    try {
        const users = await userFindAll();
        res.json({ users, message: 'Users found successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
};


export const logoutSession: RequestHandler = (req: Request, res: Response) => {
    res.json({ message: 'Please remove the token on the client side to log out.' });
};

export const makeBackup: RequestHandler = async (req: Request, res: Response) => {
    try {
        const backupFolder = path.join(__dirname, "..", "backup");
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder);
        }

        const backupCount = await Backup.count();
        const backupNumber = backupCount + 1;
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFileName = `Backup ${backupNumber}-${timestamp}.sql`;
        const backupFile = path.join(backupFolder, backupFileName);

        const command = `PGPASSWORD="${process.env.DATABASE_PASSWORD}" pg_dump -U ${process.env.DATABASE_USER} -h ${process.env.DATABASE_HOST} -d ${process.env.DATABASE_NAME} -F c > "${backupFile}"`;

        exec(command, async (error, stdout, stderr) => {
            if (error) {
                console.error("Error creating backup:", error);
                await Backup.create({
                    backupName: backupFileName,
                    backupDate: new Date(),
                    backupPath: backupFile,
                    backupSize: "0",
                    backupType: "Compressed",
                    backupStatus: "Failed",
                    backupNote: stderr || "Error while creating backup",
                });
                res.status(500).json({ message: 'Error creating backup', error });
                return;
            }

            const backupStats = fs.statSync(backupFile);
            const backupSize = `${(backupStats.size / (1024 * 1024)).toFixed(2)} MB`;

            await Backup.create({
                backupName: backupFileName,
                backupDate: new Date(),
                backupPath: backupFile,
                backupSize,
                backupType: "Compressed",
                backupStatus: "Success",
                backupNote: null,
            });

            console.log("Backup created successfully:", backupFileName);
            res.status(200).json({ message: 'Backup created successfully' });
        });
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        res.status(500).json({ message: 'An unexpected error occurred', error: (error as Error).message });
    }
};

export const getBackup: RequestHandler = async (req: Request, res: Response) => {
    try {
        const getBackup = await Backup.findAll();
        res.json({ getBackup, message: 'Backups found successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
};

export const restoreBackup: RequestHandler = async (req: Request, res: Response) => {
    try {
        const uuid = req.params.id;
        if (!uuid) {
            res.status(400).json({ message: 'Backup UUID is required' });
            return;
        }

        const backup = await Backup.findOne({ where: { id: uuid } });
        if (!backup) {
            res.status(404).json({ message: 'Backup not found' });
            return;
        }

        const backupFile = backup.get('backupPath') as string;
        if (!fs.existsSync(backupFile)) {
            res.status(404).json({ message: 'Backup file not found' });
            return;
        }

        const command = `PGPASSWORD="${process.env.DATABASE_PASSWORD}" pg_restore -U ${process.env.DATABASE_USER} -h ${process.env.DATABASE_HOST} -d ${process.env.DATABASE_NAME} "${backupFile}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("Error restoring backup:", error);
                res.status(500).json({ message: 'Error restoring backup', error });
            } else {
                console.log("Backup restored successfully:", backupFile);
                res.status(200).json({ message: 'Backup restored successfully' });
            }
        });
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        res.status(500).json({ message: 'An unexpected error occurred', error: (error as Error).message });
    }
};

export const deleteBackup: RequestHandler = async (req: Request, res: Response) => {
    try {
        const uuid = req.params.id;
        if (!uuid) {
            res.status(400).json({ message: 'Backup UUID is required' });
            return;
        }

        const backup = await Backup.findOne({ where: { id: uuid } });
        if (!backup) {
            res.status(404).json({ message: 'Backup not found' });
            return;
        }

        const backupFile = backup.get('backupPath') as string;
        if (!fs.existsSync(backupFile)) {
            res.status(404).json({ message: 'Backup file not found' });
            return;
        }

        fs.unlinkSync(backupFile);
        await Backup.destroy({ where: { id: uuid } });
        res.status(200).json({ message: 'Backup deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
};