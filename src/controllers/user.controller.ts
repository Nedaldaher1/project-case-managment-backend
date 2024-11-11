import { userCreate, userUpdate, userDelete, userFindAll } from "../services/user.services";
import bcrypt from 'bcrypt';
import User from "../models/user.model";
import { Request, Response, RequestHandler } from 'express';

export const createUser: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { username, password, role } = req.body;

        // التحقق من اسم المستخدم وكلمة المرور
        if (!username) {
            res.json({ message: 'Username is required' });
        } else if (!password) {
            res.json({ message: 'Password is required' });
        } else {
            // التحقق مما إذا كان المستخدم موجودًا بالفعل
            const userExists = await User.findOne({ where: { username } });
            if (userExists) {
                res.json({ message: 'Username already exists' });
            } else {
                // التحقق من وجود المفتاح الخاص في البيئة
                const privateKey = process.env.Private_Key;
                if (!privateKey) {
                    throw new Error('Private_Key is not defined in environment variables');
                }

                // تشفير كلمة المرور
                const hashedPassword = await bcrypt.hash(password, 10);

                // إنشاء المستخدم
                const user = await userCreate({ username, password: hashedPassword, role });
                const userRoleFromDb = user.get('role') as string;
                const memberNumber = user.get('member_id') as number;

                // التحقق من وجود المعرّف
                const userId = user.get('id') as string;
                if (!userId) {
                    throw new Error('User ID not found');
                }

                req.session.user = {
                    id: userId,
                    username: username,
                    role: userRoleFromDb,
                    memberNumber: memberNumber
                };

                // إرجاع التوكن والمستخدم
                res.json({
                    user: req.session.user,
                    message: 'User created successfully'
                });
            }
        }

    } catch (error) {
        console.error(error);
        res.json({ message: 'An error occurred', error: (error as Error).message });
    }
}
    



export const userLogin: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

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
                            username: username,
                            role: user.get('role') as string,
                            memberNumber: user.get('member_id') as number
                        };

                        res.json({ message: 'تم تسجيل الدخول بنجاح بعد تسجيل الخروج من الجلسة السابقة', user: req.session.user });
                    });
                } else {
                    res.status(500).json({ message: 'حدث خطأ أثناء إعداد الجلسة' });
                }
            });
        } else {
            // إنشاء جلسة جديدة مباشرة إذا لم يكن هناك جلسة حالية للمستخدم
            req.session.user = {
                id: user.get('id') as string,
                username: username,
                role: user.get('role') as string,
                memberNumber: user.get('member_id') as number
            };

            res.json({ message: 'تم تسجيل الدخول بنجاح', user: req.session.user });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ ما', error: (error as Error).message });
    }
};



export const userAuthentication: RequestHandler = (req: Request, res: Response) => {
    try {

        console.log('User:', req.session);
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

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // تحديث المستخدم
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