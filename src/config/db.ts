// src/config/db.ts
import { Sequelize, Op } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME || 'default_db',
  process.env.DATABASE_USER || 'default_user',
  process.env.DATABASE_PASSWORD || 'default_password',
  {
    host: process.env.DATABASE_HOST || 'localhost',
    dialect: (process.env.DATABASE_DIALECT as 'postgres') || 'postgres',
    logging: false,
  }
);

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('تم الاتصال بقاعدة البيانات بنجاح.');
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات:', error);
  }
};

export const syncModels = async (): Promise<void> => {
  try {
    const { default: User } = await import('../models/user.model');
    const { default: Case_public } = await import('../models/case_public.model');
    const { default: Case_private } = await import('../models/case_private.model');
    const { default: Backup } = await import('../models/backup.model');
    const { default: ProsecutionData } = await import('../models/prosecutionData.model');
    const { default: ProsecutionOffice } = await import('../models/prosecutionOffice.model');

    const force = true
    const alter = false;

    await User.sync({ force, alter });
    await Case_public.sync({ force, alter });
    await Case_private.sync({ force, alter });
    await Backup.sync({ force, alter });
    await ProsecutionData.sync({ force, alter });
    await ProsecutionOffice.sync({ force, alter });

    // إضافة بيانات النيابات التلقائية
    const prosecutionOffices = [
      'النيابة الكلية',
      'نيابة قسم اول المنصورة الجزئية',
      'نيابة قسم ثاني المنصورة الجزئية',
      'نيابة مركز المنصورة الجزئية',
      'نيابة طلخا الجزئية',
      'نيابة السنبلاوين الجزئية',
      'نيابة اجا الجزئية',
      'نيابة قسم ميت غمر الجزئية',
      'نيابة تمي الامديد الجزئية',
      'نيابة مركز ميت غمر الجزئية'
    ];

    await ProsecutionOffice.bulkCreate(
      prosecutionOffices.map(name => ({ name })),
      { ignoreDuplicates: true } // تجنب إضافة بيانات مكررة
    );

    console.log('Models synced and initial data prepared successfully!');
  } catch (error) {
    console.error('An error occurred while synchronizing forms:', error);
  }
};

export { sequelize, Op };