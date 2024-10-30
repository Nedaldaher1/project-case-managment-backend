import { Hono } from 'hono';
import caseRouter from './routes/case.route.js';
import userRouter from './routes/user.route.js';
import type { Context, Next } from 'hono';
import sequelize from './config/db.js';
import {syncModels} from './config/db.js';
import dotenv from 'dotenv';
import { cors } from 'hono/cors'
dotenv.config();

const app = new Hono();

// تعديل إعدادات CORS للسماح لجميع المصادر
app.use('*', cors({
  origin: (origin) => { return origin }, // الأصل المسموح به
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // إذا كنت تحتاج إلى إرسال ملفات تعريف الارتباط
}))

// تهيئة قاعدة البيانات
sequelize.sync().then( async() => {
  await syncModels();
});

// اريد طباعة كل مايحدث من احداث في السيرفر
app.use((c: Context, next: Next) => {
  console.log(`Request received: ${c.req.method} ${c.req.url}`);
  return next();
});

// استخدام المسارات
app.route('/api', caseRouter);
app.route('/auth', userRouter);

export default app;
