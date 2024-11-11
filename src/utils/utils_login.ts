import { sign, verify } from 'jsonwebtoken';
export const createToken = async (userId: string, role: string) => {
    // التحقق من وجود المفتاح الخاص في البيئة
    const privateKey = process.env.Private_Key;
    if (!privateKey) {
        throw new Error('Private_Key is not defined in environment variables');
    }

    // إنشاء التوكن مع ضبط وقت انتهاء الصلاحية (اختياري)
    const payload = {
        id: userId,
        role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours,
    };

    // انتظار التوكن باستخدام await
    const token = await sign(payload, privateKey, { algorithm: 'HS256' });

    return token;
};

export const verifyToken = async (token: string) => {
    // التأكد من وجود المفتاح الخاص في البيئة
    const privateKey = process.env.Private_Key;
    if (!privateKey) {
        throw new Error('Private_Key is not defined in environment variables');
    }

    try {
        // التحقق من صحة التوكن وفكه
        const payload = await verify(token, privateKey, { algorithms: ['HS256'] });
        // إرجاع المحتوى المفكوك للتوكن مع حالة التوكن
        return { payload, tokenStatus: true };
    } catch (error) {
        // في حالة فشل التحقق من صحة التوكن
        return { payload: null, tokenStatus: false };
    }
};