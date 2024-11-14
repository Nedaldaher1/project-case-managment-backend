import path from 'path';
import fs from 'fs';
import qr from 'qr-image';
import speakeasy from 'speakeasy';
import User from '../models/user.model';

export const verifyToken2FA = (token: string, secret: string) => {
    const isVerified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
    });

    if (!isVerified) {
        
        throw new Error('Invalid token');
    }

    return true;
};


export const generateQRCode = async (uuid: string, username: string) => {
    try {
        // البحث عن المستخدم باستخدام uuid
        const user = await User.findByPk(uuid);
        if (!user) {
            throw new Error('User not found');
        }

        // استخراج الـ secret2FA و الـ otpAuthUrl
        const secret2FA = user.get('secret2FA') as { otpauth_url: string };
        if (!secret2FA || !secret2FA.otpauth_url) {
            throw new Error('Invalid 2FA secret or URL');
        }
        
        const otpAuthUrl = secret2FA.otpauth_url;
        
        console.log('otpAuthUrl:', otpAuthUrl);

        // مسار حفظ الصورة
        const filePath = path.join(__dirname, '..', 'images', `${username}.png`);

        // التأكد من أن المجلد موجود، وإذا لم يكن، قم بإنشائه
        const directoryPath = path.dirname(filePath);
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        // توليد وحفظ رمز QR كملف PNG
        qr.image(otpAuthUrl, { type: 'png' }).pipe(fs.createWriteStream(filePath));

        console.log(`QR code saved successfully at: ${filePath}`);
        return filePath;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error generating QR code:', error.message);
        }
        throw new Error('Failed to generate QR code');
    }
};

