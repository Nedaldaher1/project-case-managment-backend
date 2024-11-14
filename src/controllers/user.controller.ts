import { userCreate, userUpdate, userDelete, userFindAll } from "../services/user.services";
import bcrypt from 'bcrypt';
import User from "../models/user.model";
import { Request, Response, RequestHandler } from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs, { stat } from 'fs';
import Backup from "../models/backup.model"; // يجب تعديل المسار حسب مكان تعريف النموذج
import speakeasy from 'speakeasy';
import { generateQRCode } from "../utils/utils_login";


export const createUser: RequestHandler = async (req: Request, res: Response) => {
    try {
        let { username, password, role } = req.body;
        username = username?.trim();
        password = password?.trim();

        if (!username) {
            res.json({ message: 'Username is required' });
        } else if (!password) {
            res.json({ message: 'Password is required' });
        } else {
            const userExists = await User.findOne({ where: { username } });
            if (userExists) {
                res.status(400).json({ message: 'اسم المستخدم مستعمل' });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                const secret2FA = speakeasy.generateSecret({ length: 20 });


                const user = await userCreate({ username, password: hashedPassword, role, secret2FA });
                const userId = user.get('id') as string;

                if (!userId) {
                    throw new Error('User ID not found');
                }

                const id = user.get('id') as string;


                await generateQRCode(id, user.get('username') as string);




                res.json({
                    user: req.session.user,
                    message: 'User created successfully. Access your token using the provided URL.'
                });
            }
        }

    } catch (error) {
        console.error(error);
        res.json({ message: 'An error occurred', error: (error as Error).message });
    }
};




export const enable2FA: RequestHandler = async (req: Request, res: Response) => {
    try {
        const uuid = req.param('id');
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
        const userUpdate = await User.update({ is_2fa_enabled: true }, { where: { id: uuid } });

        res.json({ user: userUpdate, message: '2FA enabled successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
}


export const verifyToken2FAHandler: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { token, uuid } = req.body;
        const user = await User.findByPk(uuid);

        if (!user) {
            console.log('User not found');
            res.status(404).json({ message: 'User not found' });
            return;
        }
        console.log('user:', user);
        const userSecret2FA = user.get('secret2FA') as { base32: string };

        const otpauth = userSecret2FA.base32;

        console.log('otpauth:', otpauth);

        if (!userSecret2FA) {
            console.log('2FA secret not found');
            res.status(404).json({ message: '2FA secret not found' });
            return;

        }

        // تحقق من الرمز باستخدام مكتبة speakeasy
        const verified = speakeasy.totp.verify({
            secret: otpauth,
            encoding: 'base32',
            token,
            window: 4,
        });
        if (!verified) {
            console.log('Invalid token');
            res.status(401).json({ message: 'Invalid token' });
            return
        }
        req.session.user = {
            id: user.get('id') as string,
            username: user.get('username') as string,
            role: user.get('role') as string,
            memberNumber: user.get('member_id') as number
        };
        console.log("user verifyToken2FAHandler :", req.session.user);
        res.status(200).json({ message: 'Token verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
};


export const userLogin: RequestHandler = async (req: Request, res: Response) => {
    try {
        let { username, password } = req.body;
        username = username?.trim();
        password = password?.trim();
        // التحقق من اسم المستخدم وكلمة المرور
        if (!username || !password) {
            res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });
            return;
        }

        // البحث عن المستخدم
        const user = await User.findOne({ where: { username } });

        // التحقق من وجود المستخدم وصحة كلمة المرور
        if (!user || !await bcrypt.compare(password, user.get('password') as string)) {
            res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
            return;
        }

        // التحقق مما إذا كان هناك جلسة سابقة للمستخدم الحالي
        if (req.session && req.session.user && req.session.user.id === user.get('id')) {
            // إذا كان هناك جلسة، يتم تدميرها أولاً
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying previous session:', err);
                    res.status(500).json({ message: 'حدث خطأ أثناء تدمير الجلسة السابقة' });
                    return;
                }

                // إنشاء جلسة جديدة للمستخدم بعد تدمير الجلسة السابقة
                if (req.session && req.session.regenerate) {
                    req.session.regenerate((err) => {
                        if (err) {
                            console.error('Error regenerating session:', err);
                            res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الجلسة الجديدة' });
                            return;
                        }
                        // تخزين بيانات المستخدم في الجلسة الجديدة

                        req.session.user = {
                            id: user.get('id') as string,
                            username: user.get('username') as string,
                            role: user.get('role') as string,
                            memberNumber: user.get('member_id') as number
                        };

                        res.json({ message: 'تم تسجيل الدخول بنجاح بعد تسجيل الخروج من الجلسة السابقة', user: req.session.user });
                    });
                } else {
                    res.status(500).json({ message: 'حدث خطأ أثناء إعداد الجلسة' });
                }
            });
        }

        res.json({ message: 'تم تسجيل الدخول بنجاح', user });

        req.session.user = {
            id: user.get('id') as string,
            username: user.get('username') as string,
            role: user.get('role') as string,
            memberNumber: user.get('member_id') as number
        };
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ ما', error: (error as Error).message });
    }
};

export const userAuthentication: RequestHandler = (req: Request, res: Response) => {
    try {
        console.log('req.session:', req.session);
        // التحقق من وجود بيانات المستخدم في الجلسة
        if (!req.session.user) {
            res.status(401).json({ message: 'Unauthorized - Please log in' });
            return;
        }

        // إذا كانت بيانات المستخدم موجودة في الجلسة، يتم إرجاع المعلومات المطلوبة
        res.json({
            message: 'User is authenticated',
            user: req.session.user
        });

    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
};



export const userEdit: RequestHandler = async (req: Request, res: Response) => {
    try {

        const { username, password, role } = req.body
        const id = req.param('id');
        // التحقق من اسم المستخدم وكلمة المرور
        if (!username) {
            res.status(400).json({ message: 'Username is required' });
            return;
        }
        if (!password) {
            res.status(400).json({ message: 'Password is required' });
            return;
        }

        // التحقق من وجود المستخدم
        const user = await User.findByPk(id);
        const getUsrname = user?.get('username') as string;
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // التحقق من وجود المعرّف
        const userId = user.get('id') as string;
        if (!userId) {
            res.status(404).json({ message: 'User ID not found' });
            return;
        }

        // التحقق من وجود المفتاح الخاص في البيئة
        const privateKey = process.env.Private_Key;
        if (!privateKey) {
            throw new Error('Private_Key is not defined in environment variables');
        }
        if (username === getUsrname) {
            res.status(400).json({ message: "اسم المستخدم موجود مسبقاً، لا يمكن إضافته أو تعديله." });
        }
        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await userUpdate(id, { username, password: hashedPassword, role });
        const userRoleFromDb = updatedUser.get('role') as string;
        const memberNumber = updatedUser.get('member_id') as number;
        // إرجاع المستخدم
        res.json({
            user: { id: userId, username, role: userRoleFromDb, memberNumber },
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.json({ message: 'An error occurred', error: (error as Error).message });
    }
};

export const userDeleteById: RequestHandler = async (req: Request, res: Response) => {
    try {
        const id = req.param('id');

        // التحقق من وجود المستخدم
        const user = await User.findByPk(id);
        if (!user) {
            res.json({ message: 'User not found' });
        }

        // حذف المستخدم
        const deletedUser = await userDelete(id);

        // إرجاع المستخدم
        res.json({ user: deletedUser, message: 'User deleted successfully' });

    } catch (error) {
        console.error(error);
        res.json({ message: 'An error occurred', error: (error as Error).message });
    }
}
export const getAllUsers: RequestHandler = async (req: Request, res: Response) => {
    try {
        // البحث عن جميع المستخدمين
        const users = await userFindAll();

        // إرجاع المستخدمين
        res.json({ users, message: 'Users found successfully' });

    } catch (error) {
        console.error(error);
        res.json({ message: 'An error occurred', error: (error as Error).message });
    }
}


export const logoutSession = (req: Request, res: Response) => {
    try {
        // تدمير الجلسة
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).json({ message: 'An error occurred while destroying the session' });
                return;
            }

            res.json({ message: 'Session destroyed successfully' });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
    }
}

export const makeBackup: RequestHandler = async (req: Request, res: Response) => {
    try {
        const backupFolder = path.join(__dirname, "..", "backup");
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder);
        }

        // احصل على عدد النسخ الموجودة مسبقاً
        const backupCount = await Backup.count();
        const backupNumber = backupCount + 1;
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFileName = `نسخة احتياطية رقم ${backupNumber}-${timestamp}.sql`;
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
                    backupNote: stderr || "خطأ أثناء إنشاء النسخة الاحتياطية",
                });
                return res.status(500).json({ message: 'Error creating backup', error });
            }

            const backupStats = fs.statSync(backupFile);
            const backupSize = `${(backupStats.size / (1024 * 1024)).toFixed(2)} MB`;

            const backup = await Backup.create({
                backupName: backupFileName,
                backupDate: new Date(),
                backupPath: backupFile,
                backupSize,
                backupType: "Compressed",
                backupStatus: "Success",
                backupNote: null,
            });

            console.log("Backup created successfully:", backup.get('id'));
            res.status(200).json({ message: 'Backup created successfully' });
        });
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        res.status(500).json({ message: 'An unexpected error occurred', error: (error as Error).message });
    }
};


export const getBackup: RequestHandler = async (req: Request, res: Response) => {
    try {
        // مسار المجلد الذي يحتوي على النسخ الاحتياطية
        const getBackup = await Backup.findAll();
        res.json({ getBackup, message: 'Backups found successfully' });

    } catch (error) {
        console.error(error);
        res.json({ message: 'An error occurred', error: (error as Error).message });
    }
}

export const restoreBackup: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const uuid = req.param('id');
        if (!uuid) {
            res.status(400).json({ message: 'Backup UUID is required' });
            return;
        }

        // البحث عن النسخة الاحتياطية في قاعدة البيانات باستخدام UUID
        const backup = await Backup.findOne({ where: { id: uuid } });
        if (!backup) {
            res.status(404).json({ message: 'Backup not found' });
            return;
        }

        const backupFile = backup.get('backupPath') as string;

        // التحقق من وجود ملف النسخة الاحتياطية
        if (!fs.existsSync(backupFile)) {
            res.status(404).json({ message: 'Backup file not found' });
            return;
        }

        // أمر استعادة النسخة الاحتياطية
        const command = `PGPASSWORD="${process.env.DATABASE_PASSWORD}" pg_dump -U ${process.env.DATABASE_USER} -h ${process.env.DATABASE_HOST} -d ${process.env.DATABASE_NAME} -F c -T public.backups -f "${backupFile}"`;

        // تنفيذ أمر الاستعادة
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
        const uuid = req.param('id');
        if (!uuid) {
            res.status(400).json({ message: 'Backup UUID is required' });
            return;
        }

        // البحث عن النسخة الاحتياطية في قاعدة البيانات باستخدام UUID
        const backup = await Backup.findOne({ where: { id: uuid } });
        if (!backup) {
            res.status(404).json({ message: 'Backup not found' });
            return;
        }

        const backupFile = backup.get('backupPath') as string;

        // التحقق من وجود ملف النسخة الاحتياطية
        if (!fs.existsSync(backupFile)) {
            res.status(404).json({ message: 'Backup file not found' });
            return;
        }

        // حذف ملف النسخة الاحتياطية
        fs.unlinkSync(backupFile);

        // حذف النسخة الاحتياطية من قاعدة البيانات
        await Backup.destroy({ where: { id: uuid } });

        res.status(200).json({ message: 'Backup deleted successfully' });

    } catch (error) {
        console.error(error);
        res.json({ message: 'An error occurred', error: (error as Error).message });
    }
}