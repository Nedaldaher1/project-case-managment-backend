// src/models/prosecutionOffice.model.ts
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

const ProsecutionOffice = sequelize.define('ProsecutionOffice', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: false,  // لا حاجة للحقول التي تحتوي على تاريخ وإنشاء
  tableName: 'prosecution_offices',  // اسم الجدول في قاعدة البيانات
});

export default ProsecutionOffice;
