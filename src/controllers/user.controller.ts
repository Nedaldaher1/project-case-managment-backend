import { userCreate } from "../services/user.services.js";
import { sign } from 'hono/jwt';
import bcrypt from 'bcrypt';
import type { Context } from "hono";
import User from "../models/user.model.js";

export const createUser = async (c: Context) => {
    try {
        const { username, password } = await c.req.json();

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
        const user = await userCreate({ username, password: hashedPassword });

        // التحقق من وجود المعرّف
        const userId = user.get('id');
        if (!userId) {
            throw new Error('User ID not found');
        }

        // إنشاء التوكن مع ضبط وقت انتهاء الصلاحية (اختياري)
        const payload = {
            id: userId,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
        };

        // انتظار التوكن باستخدام await
        const token = await sign(payload, privateKey);

        console.log(token); // الآن يمكنك طباعة التوكن الفعلي

        // إرجاع التوكن والمستخدم
        return c.json({ 
            token, 
            user: { id: userId, username }, 
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
        const userId = user.get('id');
        if (!userId) {
            throw new Error('User ID not found');
        }

        // التحقق من وجود المفتاح الخاص في البيئة
        const privateKey = process.env.Private_Key;
        if (!privateKey) {
            throw new Error('Private_Key is not defined in environment variables');
        }

        // إنشاء التوكن مع ضبط وقت انتهاء الصلاحية (اختياري)
        const payload = {
            id: userId,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
        };

        // انتظار التوكن باستخدام await
        const token = await sign(payload, privateKey);

        console.log(token); // الآن يمكنك طباعة التوكن الفعلي

        // إرجاع التوكن والمستخدم
        return c.json({ 
            token, 
            user: { id: userId, username }, 
            message: 'User logged in successfully' 
        }, 200);

    } catch (error) {
        // التعامل مع الأخطاء
        console.error(error);
        return c.json({ message: 'An error occurred', error: (error as Error).message }, 500);
}

}