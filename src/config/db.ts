import { Sequelize, Op } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

// Database connection setup
const sequelize = new Sequelize(
  process.env.DATABASE_NAME || 'default_db', // Database name
  process.env.DATABASE_USER || 'default_user', // Username
  process.env.DATABASE_PASSWORD || 'default_password', // Password
  {
    host: process.env.DATABASE_HOST || 'localhost', // Database host
    dialect: (process.env.DATABASE_DIALECT as 'postgres') || 'postgres', // Database dialect
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
    // Import models dynamically to avoid circular dependency
    const { default: User } = await import('../models/user.model');
    const { default: Case_public } = await import('../models/case_public.model');
    const { default: Case_private } = await import('../models/case_private.model');
    const { default: Backup } = await import('../models/backup.model');

    // Synchronize models with the database
    await User.sync({ force: true });
    await Case_public.sync({ force: true });
    await Case_private.sync({ force: true });
    await Backup.sync({ force: true });    
    console.log('Database & tables created or updated!');
  } catch (error) {
    console.error('Error synchronizing the models:', error);
  }
};

// Export sequelize and Op
export { sequelize, Op };
