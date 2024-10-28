import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('issues', 'postgres', '123123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

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
    await sequelize.sync({ force: true }); // استخدم `force: true` لإعادة إنشاء الجداول
    console.log('Database & tables created or updated!');
  } catch (error) {
    console.error('Error synchronizing the models:', error);
  }
};

export default sequelize;
