import { Sequelize, Op } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // تحميل متغيرات البيئة من ملف .env

// إعداد الاتصال بقاعدة البيانات باستخدام متغيرات البيئة
const sequelize = new Sequelize(
  process.env.DATABASE_NAME || 'default_db', // اسم قاعدة البيانات
  process.env.DATABASE_USER || 'default_user', // اسم المستخدم
  process.env.DATABASE_PASSWORD || 'default_password', // كلمة المرور
  {
    host: process.env.DATABASE_HOST || 'localhost', // عنوان قاعدة البيانات
    dialect: process.env.DATABASE_DIALECT as 'postgres' || 'postgres', // نوع قاعدة البيانات
    logging: false,
  }
);

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export const syncModels = async (): Promise<void> => {
  try {
    await sequelize.sync({ force: true }); // استخدم force: true لإعادة إنشاء الجداول عند الحاجة
    console.log('Database & tables created or updated!');
  } catch (error) {
    console.error('Error synchronizing the models:', error);
  }
};

// تصدير `sequelize` و `Op`
export { sequelize, Op };
