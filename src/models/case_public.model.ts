// src/models/case.model.ts
import { DataTypes } from 'sequelize';
import { sequelize, Op } from '../config/db';

const Case_public = sequelize.define('Case_public', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  caseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  defendantName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imprisonmentDuration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY, // استخدام DATEONLY لتجنب مشاكل الوقت
    allowNull: false,
    validate: {
      isDate: {
        msg: 'يجب أن يكون التاريخ صالحًا (YYYY-MM-DD)',
        args: true
      }
    }
  },
  issuingDepartment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  member_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type_case: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'السنة',
  },
  officeNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'رقم الدائرة',
  },
  investigationID: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'رقم التحقيق',
  }
},
  {
    timestamps: true,
    tableName: 'case_public',
  }

);

export default Case_public;
