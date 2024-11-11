import { DataTypes } from 'sequelize';
import  {sequelize, Op } from '../config/db';

const User = sequelize.define('users', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  }, 
  member_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "editor"
  }
}, {
  tableName: 'users', // تأكد من تطابق اسم الجدول
  timestamps: false,
});



export default User;
