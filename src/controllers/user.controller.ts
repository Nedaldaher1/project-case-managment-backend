import { userCreate } from "../services/user.services.js";
import bcrypt from 'bcrypt';
import type { Context } from "hono";
import User from "../models/user.model.js";
import { createToken, verifyToken } from "../utils/utils_login.js";

export const createUser = async (c: Context) => {
    try {
        const { username, password, role } = await c.req.json();

        // التحقق من اسم المستخدم وكلمة المرور
        if (!username) {
            return c.json({ message: 'Username is required' }, 400);
        }
        if (!password) {
            return c.json({ message: 'Password is required' }, 400);
        }

        // التحقق مما إذا كان المستخدم موجودًا بالفعل
        const userExists = await User.findOne({ where: { username } });
        if (userExists) {
            return c.json({ message: 'Username already exists' }, 400);
        }

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
        // انتظار التوكن باستخدام await
        const token = await createToken(userId, role);
        // إرجاع التوكن والمستخدم
        return c.json({
            token,
            user: { id: userId, username, role: userRoleFromDb , memberNumber },
            message: 'User created successfully'
        }, 201);

    } catch (error) {
        // التعامل مع الأخطاء
        console.error(error);
        return c.json({ message: 'An error occurred', error: (error as Error).message }, 500);
    }

}

export const userLogin = async (c: Context) => {
    try {
        const { username, password } = await c.req.json();

        // التحقق من اسم المستخدم وكلمة المرور
        if (!username) {
            return c.json({ message: 'اسم المستخدم ملطوب' }, 400);
        }
        if (!password) {
            return c.json({ message: 'كلمة السر مطلوبة' }, 400);
        }

        // البحث عن المستخدم
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return c.json({ message: ' اسم المستخدم او كلمة المرور غير صحيحة' }, 404);
        }

        // التحقق من صحة كلمة المرور
        const isValidPassword = await bcrypt.compare(password, user.get('password') as string);
        if (!isValidPassword) {
            return c.json({ message: ' اسم المستخدم او كلمة المرور غير صحيحة' }, 400);
        }

        // التحقق من وجود المعرّف
        const userId = user.get('id') as string;
        const role = user.get('role') as string;
        const memberNumber = user.get('member_id') as number;

        if (!userId) {
            throw new Error('User ID not found');
        }

        // التحقق من وجود المفتاح الخاص في البيئة
        const privateKey = process.env.Private_Key;
        if (!privateKey) {
            throw new Error('Private_Key is not defined in environment variables');
        }



        // انتظار التوكن باستخدام await
        const token = await createToken(userId, role);

        // إرجاع التوكن والمستخدم
        return c.json({
            token,
            user: { id: userId, username, role,memberNumber },
            message: 'User logged in successfully'
        }, 200);

    } catch (error) {
        // التعامل مع الأخطاء
        console.error(error);
        return c.json({ message: 'An error occurred', error: (error as Error).message }, 500);
    }

}

export const userAuthuntication = async (c: Context) => {
    try {
        let token = c.req.header('Authorization');
        if (!token) {
            const message = 'Token is required';
            console.log(message);
            return c.json({ message }, 401);
        }

        // إزالة "Bearer " من بداية التوكن
        token = token.replace(/^Bearer\s+/i, '');

        const { tokenStatus, payload } = await verifyToken(token);

        if (!tokenStatus) {
            return c.json({}, 401);
        }



        return c.json({ payload, tokenStatus }, 200);

    } catch (error) {
        console.error(error);
        return c.json({ message: 'An error occurred', error: (error as Error).message }, 500);
    }
};

