import { DataTypes } from 'sequelize';
import { sequelize, Op } from '../config/db';
import User from './user.model';

const Case_private = sequelize.define('Case_private', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  caseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'رقم القضية',
  },
  memberNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'رقم العضو',
  },
  accusation: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'التهمة',
  },
  accusedName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'اسم المتهم',
  },
  year:{
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'السنة',
  },
  defendantQuestion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'سؤال المتهم',
  },
  officerQuestion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'سؤال الظابط',
  },
  victimQuestion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'سؤال المجني عليه',
  },
  witnessQuestion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'سؤال الشهود',
  },
  technicalReports: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'تقارير فنية',
  },
  investigationID:{
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'رقم التحقيق',
  },
  caseType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'نوع القضية',
  },
  caseReferral: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'جاهزة للتصرف',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
    },
    comment: 'معرف المستخدم الذي أنشأ القضية',
  },
  reportType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'نوع التقرير',
  },
  actionOther: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'أخرى',
  },


}, {
  timestamps: true,
  tableName: 'case_private',
});

Case_private.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Case_private, { foreignKey: 'userId' });

export default Case_private;
