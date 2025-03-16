import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import caseRouter from './routes/case_public.route';
import userRouter from './routes/user.route';
import AuditlogRouter from './routes/auditLog.routes';
import ArchivesRouter from './routes/archives.route';
import caseRouterPrivate from './routes/case_private.route';
import { sequelize } from './config/db';
import { syncModels } from './config/db';

dotenv.config();

const app = express();

// إعداد body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إعداد CORS لقبول الطلبات القادمة من file:// (أصلها null)
app.use(cors({
  origin:true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// ميدلوير تسجيل الطلبات
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  console.log(`Request received: ${req.method} ${req.url}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  if (Object.keys(req.query).length > 0) {
    console.log('Query Parameters:', req.query);
  }
  if (Object.keys(req.params).length > 0) {
    console.log('Route Parameters:', req.params);
  }

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const statusText = statusCode >= 200 && statusCode < 300 ? 'Success' : 'Failure';
    console.log(`Request to ${req.method} ${req.url} took ${duration}ms`);
    console.log(`Status Code: ${statusCode} - ${statusText}`);
  });
  next();
});

// تهيئة قاعدة البيانات
sequelize.sync().then(async () => {
  await syncModels();
  console.log('Database connected and synchronized.');
});

// استخدام المسارات
app.use('/api/public', caseRouter);
app.use('/api/private', caseRouterPrivate);
app.use('/api/audit-logs', AuditlogRouter);
app.use('/auth', userRouter);
app.use('/archives', ArchivesRouter);

export default app;
