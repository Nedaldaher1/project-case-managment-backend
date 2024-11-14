import { DataTypes } from 'sequelize';
import { sequelize, Op } from '../config/db';

const User = sequelize.define(
  'users',
  {
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
      defaultValue: 'editor',
    },
    logo: {
      type: DataTypes.STRING,
      defaultValue: 'admin.png',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isNumeric: true, // التأكد من أن رقم الهاتف يحتوي على أرقام فقط
        len: [10, 15], // التأكد من أن الطول بين 10 و 15 رقمًا
      },
    },
    is_2fa_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    secret2FA: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'users', // تأكد من تطابق اسم الجدول
    timestamps: false,
  }
);

export default User;
