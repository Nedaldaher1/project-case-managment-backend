// src/models/auditLog.model.ts
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

const AuditLog = sequelize.define('AuditLog', {
  tableName: {
    type: DataTypes.STRING(255), // استخدام STRING بدل STRING
    allowNull: false
  },
  recordId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
    allowNull: false
  },
  oldData: {
    type: DataTypes.JSONB
  },
  newData: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID // تعديل لنوع UUID إن كان مستخدماً
  }
}, {
  timestamps: true,
  tableName: 'audit_logs',
  indexes: [
    { fields: ['tableName', 'recordId'] },
    { fields: ['action'] }
  ]
});

export default AuditLog;