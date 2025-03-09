// src/models/prosecutionData.model.ts
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';
import ProsecutionOffice from './prosecutionOffice.model'; // استيراد نموذج النيابة

const ProsecutionData = sequelize.define('ProsecutionData', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  serialNumber: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  year:{
    type: DataTypes.INTEGER ,
    allowNull: false,
  },
  numberCase: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  typeCaseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  itemNumber: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  charge: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  seizureStatement: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prosecutionDetentionDecision: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  finalCourtJudgment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  typeCaseTotalNumber:{
    type: DataTypes.STRING,
    allowNull: false,
  },

  roomNumber: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  referenceNumber: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  shelfNumber: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  statusEvidence: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prosecutionOfficeId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: ProsecutionOffice,
      key: 'id',
    },
    onDelete: 'SET NULL',  // إذا تم حذف النيابة، تصبح القيمة NULL
  },
}, {
  timestamps: false,  // لا حاجة للحقول التي تحتوي على تاريخ وإنشاء
  tableName: 'prosecution_data',  // اسم الجدول في قاعدة البيانات
});

// تحديد العلاقة بين الجداول
ProsecutionOffice.hasMany(ProsecutionData, { foreignKey: 'prosecutionOfficeId' });
ProsecutionData.belongsTo(ProsecutionOffice, { foreignKey: 'prosecutionOfficeId' });

export default ProsecutionData;
