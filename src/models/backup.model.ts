import { DataTypes } from "sequelize";
import  {sequelize, Op } from '../config/db';

const Backup = sequelize.define("Backup", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // توليد UUID عشوائي باستخدام UUIDV4
        allowNull: false,
        primaryKey: true,
    },
    backupName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'اسم النسخة',
    },
    backupDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'تاريخ النسخة',
    },
    backupPath: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'مسار النسخة',
    },
    backupSize: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'حجم النسخة',
    },
    backupType: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'نوع النسخة',
    },
    backupStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'حالة النسخة',
    },
    backupNote: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'ملاحظات',
    },
}, {
    tableName: 'backups',
    timestamps: true,
});

export default Backup;
