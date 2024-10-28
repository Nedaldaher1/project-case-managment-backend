// src/app.ts
import { Hono } from 'hono';
import caseRouter from './routes/case.route.js';
import userRouter from './routes/user.route.js';
import type { Context, Next } from 'hono';
import sequelize from './config/db.js';
import dotenv from 'dotenv';
import { cors } from 'hono/cors'
dotenv.config();

const app = new Hono();

// تهيئة قاعدة البيانات
sequelize.sync().then(() => {
  console.log('Database synced');
});

// اريد طباعة كل مايحدث من احداث في السيرفر
app.use((c: Context, next: Next) => {
  console.log(`Request received: ${c.req.method} ${c.req.url}`);
  return next();
});
app.use('*', cors({
  origin: 'http://localhost:3001',  // السماح فقط بطلبات من localhost:3001
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],  // تحديد الطرق المسموح بها
  allowHeaders: ['Content-Type', 'Authorization'],  // السماح بالرؤوس
  credentials: true  // إذا كنت تستخدم ملفات تعريف الارتباط أو الطلبات المعقدة
}));

// استخدام المسارات
app.route('/api', caseRouter);
app.route('/auth', userRouter);

export default app;
