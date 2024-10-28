// src/models/case.model.ts
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Case = sequelize.define('Case', {
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
    type: DataTypes.DATE,
    allowNull: false,
  },
});

export default Case;
