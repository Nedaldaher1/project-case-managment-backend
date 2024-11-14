import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import caseRouter from './routes/case_public.route';
import userRouter from './routes/user.route';
import caseRouterPrivate from './routes/case_private.route';
import { sequelize } from './config/db';
import { syncModels } from './config/db';
import cors from 'cors';
import session from 'express-session';
import PgSession from 'connect-pg-simple';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إعداد الجلسات باستخدام connect-pg-simple
app.use(
  session({
    store: new (PgSession(session))({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 8, // مدة انتهاء الجلسة 8 ساعات
      secure: process.env.NODE_ENV === 'production', // يجب أن يكون true في الإنتاج فقط
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // يمكن استخدام 'lax' أو 'none' في التطوير
    }
  })
);




app.use((req: Request, res: Response, next: NextFunction) => {
  // Record the current time
  const startTime = Date.now();

  // Log request details
  console.log(`Request received: ${req.method} ${req.url}`);

  // Log request body if present (for POST, PUT, PATCH, etc.)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }

  // Log query parameters if present
  if (Object.keys(req.query).length > 0) {
    console.log('Query Parameters:', req.query);
  }

  // Log route parameters if present
  if (Object.keys(req.params).length > 0) {
    console.log('Route Parameters:', req.params);
  }

  // Log the time taken for the request and response status
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const statusText = statusCode >= 200 && statusCode < 300 ? 'Success' : 'Failure';

    console.log(`Request to ${req.method} ${req.url} took ${duration}ms`);
    console.log(`Status Code: ${statusCode} - ${statusText}`);
  });

  next();
});


// إعدادات CORS
app.use(cors({
  origin: (origin, callback) => { callback(null, origin); },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // يجب تمكينه للسماح للكوكيز بالعمل مع CORS
}));


// تهيئة قاعدة البيانات
sequelize.sync().then(async () => {
  await syncModels();
  console.log('Database connected and synchronized.');
});

// استخدام المسارات
app.use('/api/public', caseRouter);
app.use('/api/private', caseRouterPrivate);
app.use('/auth', userRouter);

export default app;
