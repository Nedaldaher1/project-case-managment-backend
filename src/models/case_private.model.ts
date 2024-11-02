import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.model.js';

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
  caseReferral: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'احالة القضية',
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
}, {
  timestamps: true,
  tableName: 'case_private',
});

Case_private.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Case_private, { foreignKey: 'userId' });

export default Case_private;
